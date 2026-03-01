"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { Upload, X, ImageIcon, Film, Plus, Play } from "lucide-react"

type GalleryItem = {
  id: string
  type: "image" | "video"
  url: string
  name: string
}

export function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("brillomax-gallery")
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (items.length > 0) {
      try {
        localStorage.setItem("brillomax-gallery", JSON.stringify(items))
      } catch {
        // ignore quota errors
      }
    }
  }, [items])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      if (!isImage && !isVideo) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        setItems((prev) => [
          {
            id: crypto.randomUUID(),
            type: isImage ? "image" : "video",
            url,
            name: file.name,
          },
          ...prev,
        ])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id)
      if (next.length === 0) {
        localStorage.removeItem("brillomax-gallery")
      }
      return next
    })
  }, [])

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
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Galería
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl text-balance">
            Resultados Reales
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Sube tus fotos y videos para mostrar el brillo de tu camión.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`relative mb-12 rounded-xl border-2 border-dashed p-12 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40"
          }`}
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
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">
            Arrastra tus archivos aquí
          </p>
          <p className="mt-1 text-sm text-muted-foreground">o</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Seleccionar Archivos
          </button>
          <p className="mt-4 text-xs text-muted-foreground">
            Imágenes y videos soportados
          </p>
        </div>

        {/* Gallery Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40"
                onClick={() => setPreviewItem(item)}
              >
                {item.type === "image" ? (
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="relative flex h-full w-full items-center justify-center bg-secondary">
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                      <Play className="h-12 w-12 text-foreground" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex w-full items-center justify-between p-3">
                    <span className="flex items-center gap-1.5 text-xs text-foreground">
                      {item.type === "image" ? (
                        <ImageIcon className="h-3.5 w-3.5" />
                      ) : (
                        <Film className="h-3.5 w-3.5" />
                      )}
                      {item.name.length > 20
                        ? item.name.slice(0, 20) + "..."
                        : item.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeItem(item.id)
                  }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Eliminar ${item.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/50 p-16 text-center">
            <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              Aún no hay contenido
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Sube imágenes o videos para verlos aquí
            </p>
          </div>
        )}
      </div>

      {/* Modal Preview */}
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
            {previewItem.type === "image" ? (
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="max-h-[85vh] rounded-xl object-contain"
              />
            ) : (
              <video
                src={previewItem.url}
                controls
                autoPlay
                className="max-h-[85vh] rounded-xl"
              />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
