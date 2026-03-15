"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import imageCompression from "browser-image-compression"
import Image from "next/image"
import { ImageIcon, LoaderCircle, Plus, Trash2, Upload, X } from "lucide-react"

import {
  deleteAdminImage,
  fetchGalleryImages,
  type GalleryImage,
  uploadAdminImage,
} from "@/lib/gallery-api"
import { clearAdminSession, useAdminSession } from "@/lib/admin-session"

export function GallerySection() {
  const { session, isLoggedIn } = useAdminSession()
  const [items, setItems] = useState<GalleryImage[]>([])
  const [previewItem, setPreviewItem] = useState<GalleryImage | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: "error" | "info" | "success"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let isMounted = true

    async function loadImages() {
      try {
        setIsLoading(true)
        const nextItems = await fetchGalleryImages()

        if (isMounted) {
          setItems(nextItems)
        }
      } catch (loadError) {
        if (isMounted) {
          setFeedback({
            type: "error",
            text:
              loadError instanceof Error
                ? loadError.message
                : "No se pudieron cargar las imágenes públicas.",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadImages()

    return () => {
      isMounted = false
    }
  }, [])

  const formatBytes = useCallback((value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
      return "0 B"
    }

    const units = ["B", "KB", "MB", "GB"]
    const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
    const size = value / 1024 ** exponent

    return `${size >= 10 ? size.toFixed(0) : size.toFixed(1)} ${units[exponent]}`
  }, [])

  const normalizeFileName = useCallback((value: string) => {
    return value
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "") || "resultado"
  }, [])

  const compressFile = useCallback(
    async (file: File) => {
      try {
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: file.size > 8 * 1024 * 1024 ? 4 : 2.4,
          maxWidthOrHeight: 2400,
          useWebWorker: true,
          initialQuality: 0.92,
          fileType:
            file.type === "image/png" ||
            file.type === "image/jpeg" ||
            file.type === "image/webp" ||
            file.type === "image/avif"
              ? "image/webp"
              : file.type,
        })

        const extension = compressedBlob.type.split("/")[1] || "webp"
        const fileName = `${normalizeFileName(file.name)}.${extension}`

        return new File([compressedBlob], fileName, {
          type: compressedBlob.type,
          lastModified: Date.now(),
        })
      } catch {
        return file
      }
    },
    [normalizeFileName]
  )

  const handleSessionFailure = useCallback((message: string) => {
    clearAdminSession()
    setFeedback({ type: "error", text: message })
  }, [])

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) {
        return
      }

      if (!session) {
        setFeedback({
          type: "info",
          text: "Inicia sesión como administrador para publicar nuevas imágenes.",
        })
        return
      }

      setIsUploading(true)
      setFeedback({
        type: "info",
        text: "Preparando y publicando imágenes en Supabase...",
      })

      let uploadedCount = 0
      let rejectedCount = 0
      let lastSuccessMessage = ""

      for (const file of Array.from(files)) {
        const isSupportedImage = ["image/png", "image/jpeg", "image/webp", "image/avif"].includes(
          file.type
        )

        if (!isSupportedImage) {
          rejectedCount += 1
          continue
        }

        try {
          const compressedFile = await compressFile(file)
          const result = await uploadAdminImage(compressedFile, session.token)

          setItems((previousItems) => [result.item, ...previousItems])
          uploadedCount += 1
          lastSuccessMessage = `Imagen publicada. Espacio restante aproximado: ${formatBytes(
            result.remainingBytes
          )} de ${formatBytes(result.maxBytes)}.`
        } catch (uploadError) {
          const message =
            uploadError instanceof Error
              ? uploadError.message
              : "No fue posible subir una de las imágenes seleccionadas."

          if (/sesion|sesión|token/i.test(message)) {
            handleSessionFailure("La sesión del administrador venció. Inicia sesión nuevamente.")
            break
          }

          setFeedback({ type: "error", text: message })
          setIsUploading(false)
          return
        }
      }

      if (uploadedCount > 0) {
        setFeedback({ type: "success", text: lastSuccessMessage })
      } else if (rejectedCount > 0) {
        setFeedback({
          type: "error",
          text: "Solo se permiten imágenes JPG, PNG, WEBP o AVIF.",
        })
      }

      setIsUploading(false)
    },
    [compressFile, formatBytes, handleSessionFailure, session]
  )

  const removeItem = useCallback(
    async (item: GalleryImage) => {
      if (!session) {
        setFeedback({
          type: "error",
          text: "Debes iniciar sesión como administrador para eliminar imágenes.",
        })
        return
      }

      try {
        setDeletingId(item.id)
        await deleteAdminImage(item.id, session.token)

        setItems((previousItems) => previousItems.filter((currentItem) => currentItem.id !== item.id))
        setPreviewItem((currentPreview) => (currentPreview?.id === item.id ? null : currentPreview))
        setFeedback({ type: "success", text: "La imagen fue eliminada correctamente." })
      } catch (deleteError) {
        const message =
          deleteError instanceof Error
            ? deleteError.message
            : "No fue posible eliminar la imagen seleccionada."

        if (/sesion|sesión|token/i.test(message)) {
          handleSessionFailure("La sesión del administrador venció. Inicia sesión nuevamente.")
        } else {
          setFeedback({ type: "error", text: message })
        }
      } finally {
        setDeletingId(null)
      }
    },
    [handleSessionFailure, session]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  return (
    <section id="galeria" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
            Galería
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl text-balance">
            Resultados Reales
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Explora algunos de los resultados más recientes compartidos en nuestra galería.
          </p>
        </div>

        {feedback ? (
          <div
            className={`mb-8 rounded-xl border px-4 py-3 text-sm ${
              feedback.type === "error"
                ? "border-destructive/40 bg-destructive/10 text-foreground"
                : feedback.type === "success"
                  ? "border-accent/30 bg-accent/10 text-foreground"
                  : "border-border bg-card/70 text-muted-foreground"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}

        {isLoggedIn ? (
          <div
            className={`relative mb-12 rounded-xl border-2 border-dashed p-12 text-center transition-all ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-accent/60"
            } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              multiple
              className="hidden"
              onChange={(event) => {
                handleFiles(event.target.files)
                event.target.value = ""
              }}
            />
            {isUploading ? (
              <LoaderCircle className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            ) : (
              <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            )}
            <p className="text-lg font-medium text-foreground">
              Arrastra tus imágenes aquí
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Se optimizan antes de subir para reducir peso sin perder calidad perceptible.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus className="h-4 w-4" />
              {isUploading ? "Publicando..." : "Seleccionar Imágenes"}
            </button>
            <p className="mt-4 text-xs text-muted-foreground">
              Formatos: JPG, PNG, WEBP y AVIF
            </p>
          </div>
        ) : (
          <div className="mb-12 rounded-2xl border border-border bg-card/60 p-8 text-center">
            <p className="text-lg font-semibold text-foreground">
              Próximamente más resultados
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Seguimos actualizando esta sección con nuevas imágenes y casos recientes.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card/50 p-16 text-center">
            <LoaderCircle className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium text-muted-foreground">Cargando resultados reales...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-accent/60"
                onClick={() => setPreviewItem(item)}
              >
                <Image
                  src={item.publicUrl}
                  alt={item.nombre}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex w-full items-center justify-between p-3">
                    <span className="flex items-center gap-1.5 text-xs text-foreground">
                      <ImageIcon className="h-3.5 w-3.5" />
                      {item.nombre.length > 22 ? item.nombre.slice(0, 22) + "..." : item.nombre}
                    </span>
                  </div>
                </div>
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      removeItem(item)
                    }}
                    disabled={deletingId === item.id}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    {deletingId === item.id ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/50 p-16 text-center">
            <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              Aún no hay resultados publicados
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Cuando el administrador suba imágenes al bucket, se mostrarán aquí automáticamente.
            </p>
          </div>
        )}
      </div>

      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
          onClick={() => setPreviewItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa de archivo"
        >
          <button
            onClick={() => setPreviewItem(null)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground transition-colors hover:bg-secondary"
            aria-label="Cerrar vista previa"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={previewItem.publicUrl}
              alt={previewItem.nombre}
              width={1600}
              height={1200}
              unoptimized
              className="max-h-[85vh] rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </section>
  )
}

