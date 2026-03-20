import { supabase, supabasePublishableKey, supabaseUrl } from "@/lib/supabase"

export type GalleryImage = {
  id: string
  nombre: string
  ruta: string
  fecha: string | null
  usuario_id: string | null
  publicUrl: string
}

export type AdminLoginResponse = {
  token: string
  userId: string
  username: string
  expiresAt: string
}

export type UploadAdminImageResponse = {
  item: GalleryImage
  usedBytes: number
  remainingBytes: number
  maxBytes: number
}

export type ComparisonSlot = "before" | "after"

export type ComparisonImages = {
  beforeUrl: string | null
  afterUrl: string | null
}

function functionUrl(name: string) {
  return `${supabaseUrl}/functions/v1/${name}`
}

async function callFunction(input: RequestInfo | URL, init: RequestInit) {
  try {
    return await fetch(input, init)
  } catch {
    throw new Error(
      "No se pudo conectar con Supabase Functions. Verifica que las funciones de administracion esten desplegadas."
    )
  }
}

async function parseFunctionResponse<T>(response: Response, fallbackMessage: string) {
  const rawBody = await response.text()
  const payload = rawBody ? JSON.parse(rawBody) : null

  if (!response.ok) {
    throw new Error(payload?.error || fallbackMessage)
  }

  return payload as T
}

function mapGalleryImage(item: {
  id: string
  nombre: string
  ruta: string
  fecha: string | null
  usuario_id: string | null
}) {
  return {
    ...item,
    publicUrl: supabase.storage.from("imagenes").getPublicUrl(item.ruta).data.publicUrl,
  }
}

function withCacheVersion(url: string, version: string | null) {
  if (!version) {
    return url
  }

  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}v=${encodeURIComponent(version)}`
}

function mapComparisonFileToUrl(path: string, createdAt: string | null) {
  const baseUrl = supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl
  return withCacheVersion(baseUrl, createdAt)
}

async function listPublicBucketImagesFallback() {
  const pendingPrefixes: string[] = [""]
  const files: Array<{ path: string; name: string; created_at: string | null }> = []

  while (pendingPrefixes.length > 0) {
    const prefix = pendingPrefixes.shift() ?? ""
    let offset = 0

    while (true) {
      const { data, error } = await supabase.storage.from("imagenes").list(prefix, {
        limit: 100,
        offset,
        sortBy: { column: "name", order: "asc" },
      })

      if (error) {
        throw new Error("No se pudieron cargar las imágenes publicadas.")
      }

      const entries = data || []

      for (const entry of entries) {
        const name = (entry as { name?: string }).name || ""
        const id = (entry as { id?: string | null }).id
        const metadata = (entry as { metadata?: { mimetype?: string } }).metadata
        const mimeType = metadata?.mimetype || ""

        if (!name) {
          continue
        }

        const path = prefix ? `${prefix}/${name}` : name

        if (id || mimeType.startsWith("image/")) {
          files.push({
            path,
            name,
            created_at: (entry as { created_at?: string | null }).created_at || null,
          })
          continue
        }

        pendingPrefixes.push(path)
      }

      if (entries.length < 100) {
        break
      }

      offset += 100
    }
  }

  return files
    .sort((left, right) => {
      const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0
      const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0
      return rightTime - leftTime
    })
    .map((file) => ({
      id: file.path,
      nombre: file.name,
      ruta: file.path,
      fecha: file.created_at,
      usuario_id: null,
      publicUrl: supabase.storage.from("imagenes").getPublicUrl(file.path).data.publicUrl,
    }))
}

export async function fetchGalleryImages() {
  const { data, error } = await supabase
    .from("imagenes")
    .select("id, nombre, ruta, fecha, usuario_id")
    .order("fecha", { ascending: false })

  if (error) {
    return listPublicBucketImagesFallback()
  }

  if (!data || data.length === 0) {
    return listPublicBucketImagesFallback()
  }

  return data.map(mapGalleryImage)
}

export async function fetchComparisonImages() {
  const functionResponse = await callFunction(functionUrl("get-comparison-images"), {
    method: "GET",
    headers: {
      apikey: supabasePublishableKey,
    },
  })

  const functionPayload = await parseFunctionResponse<ComparisonImages>(
    functionResponse,
    "No se pudieron cargar las imagenes del comparador."
  )

  if (functionPayload.beforeUrl || functionPayload.afterUrl) {
    return functionPayload
  }

  const filesBySlot: Record<ComparisonSlot, { path: string; createdAt: string | null } | null> = {
    before: null,
    after: null,
  }

  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from("imagenes").list("comparador", {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    })

    if (error) {
      throw new Error("No se pudieron cargar las imagenes del comparador.")
    }

    const entries = data || []

    for (const entry of entries) {
      const name = (entry as { name?: string }).name || ""

      if (!name) {
        continue
      }

      const slot = name.startsWith("before-")
        ? "before"
        : name.startsWith("after-")
          ? "after"
          : null

      if (!slot) {
        continue
      }

      const createdAt = (entry as { created_at?: string | null }).created_at || null
      const current = filesBySlot[slot]

      if (!current) {
        filesBySlot[slot] = {
          path: `comparador/${name}`,
          createdAt,
        }
        continue
      }

      const currentTime = current.createdAt ? new Date(current.createdAt).getTime() : 0
      const nextTime = createdAt ? new Date(createdAt).getTime() : 0

      if (nextTime >= currentTime) {
        filesBySlot[slot] = {
          path: `comparador/${name}`,
          createdAt,
        }
      }
    }

    if (entries.length < 100) {
      break
    }

    offset += 100
  }

  return {
    beforeUrl: filesBySlot.before
      ? mapComparisonFileToUrl(filesBySlot.before.path, filesBySlot.before.createdAt)
      : null,
    afterUrl: filesBySlot.after
      ? mapComparisonFileToUrl(filesBySlot.after.path, filesBySlot.after.createdAt)
      : null,
  } satisfies ComparisonImages
}

export async function loginAdmin(usuario: string, password: string) {
  const response = await callFunction(functionUrl("admin-login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
    },
    body: JSON.stringify({ usuario, password }),
  })

  return parseFunctionResponse<AdminLoginResponse>(
    response,
    "No fue posible iniciar sesión con Supabase."
  )
}

export async function uploadAdminImage(file: File, sessionToken: string) {
  const formData = new FormData()
  formData.append("token", sessionToken)
  formData.append("file", file)

  const response = await callFunction(functionUrl("admin-upload-image"), {
    method: "POST",
    headers: {
      apikey: supabasePublishableKey,
    },
    body: formData,
  })

  const payload = await parseFunctionResponse<{
    item: {
      id: string
      nombre: string
      ruta: string
      fecha: string | null
      usuario_id: string | null
    }
    usedBytes: number
    remainingBytes: number
    maxBytes: number
  }>(response, "No fue posible subir la imagen.")

  return {
    ...payload,
    item: mapGalleryImage(payload.item),
  } satisfies UploadAdminImageResponse
}

export async function deleteAdminImage(imageId: string, sessionToken: string) {
  const response = await callFunction(functionUrl("admin-delete-image"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
    },
    body: JSON.stringify({ imageId, token: sessionToken }),
  })

  await parseFunctionResponse<{ success: true }>(
    response,
    "No fue posible eliminar la imagen seleccionada."
  )
}

export async function uploadComparisonImage(
  slot: ComparisonSlot,
  file: File,
  sessionToken: string
) {
  const formData = new FormData()
  formData.append("token", sessionToken)
  formData.append("slot", slot)
  formData.append("file", file)

  const response = await callFunction(functionUrl("admin-upsert-comparison-image"), {
    method: "POST",
    headers: {
      apikey: supabasePublishableKey,
    },
    body: formData,
  })

  return parseFunctionResponse<{
    slot: ComparisonSlot
    path: string
    publicUrl: string
  }>(response, "No fue posible actualizar la imagen del comparador.")
}
