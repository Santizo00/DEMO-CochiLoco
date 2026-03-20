"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { LoaderCircle, Upload } from "lucide-react"

import { clearAdminSession, useAdminSession } from "@/lib/admin-session"
import {
  fetchComparisonImages,
  type ComparisonSlot,
  uploadComparisonImage,
} from "@/lib/gallery-api"

export function BeforeAfterSection() {
  const fallbackBeforeImage = "images/before-truck.jpg"
  const fallbackAfterImage = "images/after-truck.jpg"

  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [beforeImageUrl, setBeforeImageUrl] = useState(fallbackBeforeImage)
  const [afterImageUrl, setAfterImageUrl] = useState(fallbackAfterImage)
  const [isUploadingSlot, setIsUploadingSlot] = useState<ComparisonSlot | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)
  const { session, isLoggedIn } = useAdminSession()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadComparison() {
      try {
        const comparison = await fetchComparisonImages()

        if (!isMounted) {
          return
        }

        setBeforeImageUrl(comparison.beforeUrl || fallbackBeforeImage)
        setAfterImageUrl(comparison.afterUrl || fallbackAfterImage)
      } catch {
        if (!isMounted) {
          return
        }

        setBeforeImageUrl(fallbackBeforeImage)
        setAfterImageUrl(fallbackAfterImage)
      }
    }

    loadComparison()

    return () => {
      isMounted = false
    }
  }, [])

  const updateSlider = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setSliderPos(percent)
    },
    []
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true)
      updateSlider(e.clientX)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [updateSlider]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      updateSlider(e.clientX)
    },
    [isDragging, updateSlider]
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const uploadSlotImage = useCallback(
    async (slot: ComparisonSlot, files: FileList | null) => {
      const file = files?.[0]

      if (!file) {
        return
      }

      if (!session) {
        setFeedback("Inicia sesión para actualizar las imágenes del comparador.")
        return
      }

      if (!file.type.startsWith("image/")) {
        setFeedback("Selecciona un archivo de imagen válido.")
        return
      }

      try {
        setIsUploadingSlot(slot)
        setFeedback("Subiendo imagen del comparador...")

        const result = await uploadComparisonImage(slot, file, session.token)

        if (result.slot === "before") {
          setBeforeImageUrl(result.publicUrl)
        } else {
          setAfterImageUrl(result.publicUrl)
        }

        setFeedback("Imagen del comparador actualizada correctamente.")
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "No fue posible actualizar la imagen del comparador."

        if (/sesion|sesión|token/i.test(message)) {
          clearAdminSession()
          setFeedback("La sesión venció. Inicia sesión nuevamente para editar.")
        } else {
          setFeedback(message)
        }
      } finally {
        setIsUploadingSlot(null)
      }
    },
    [session]
  )

  return (
    <section id="comparar" className="relative py-24 lg:py-32" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
            Transformación
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl text-balance">
            Antes y Después
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Desliza para ver la diferencia que hace CochiLoco.
          </p>

          {isLoggedIn ? (
            <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-border bg-card/60 p-4 text-left">
              <input
                ref={beforeInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
                onChange={(event) => {
                  uploadSlotImage("before", event.target.files)
                  event.target.value = ""
                }}
              />
              <input
                ref={afterInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
                onChange={(event) => {
                  uploadSlotImage("after", event.target.files)
                  event.target.value = ""
                }}
              />

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Editor del comparador (admin)
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => beforeInputRef.current?.click()}
                  disabled={isUploadingSlot !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUploadingSlot === "before" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Actualizar imagen Antes
                </button>
                <button
                  type="button"
                  onClick={() => afterInputRef.current?.click()}
                  disabled={isUploadingSlot !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUploadingSlot === "after" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Actualizar imagen Después
                </button>
              </div>
              {feedback ? <p className="mt-3 text-xs text-muted-foreground">{feedback}</p> : null}
            </div>
          ) : null}
        </div>

        <div
          className={`mx-auto max-w-4xl transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div
            ref={containerRef}
            className="group relative aspect-[16/9] cursor-ew-resize select-none overflow-hidden rounded-2xl border border-border"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            role="slider"
            aria-label="Comparador antes y después"
            aria-valuenow={Math.round(sliderPos)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
          >
            {/* After (bottom layer) */}
            <Image
              src={afterImageUrl}
              alt="Camión después de aplicar CochiLoco"
              fill
              className="object-cover"
              quality={85}
              unoptimized
            />

            {/* Before (clipped top layer) */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <Image
                src={beforeImageUrl}
                alt="Camión antes de aplicar CochiLoco"
                fill
                className="object-cover"
                quality={85}
                unoptimized
              />
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 z-10 w-1 bg-primary"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-background glow-blue-sm">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-primary"
                >
                  <path
                    d="M6 4L2 10L6 16M14 4L18 10L14 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute left-4 top-4 z-10 rounded-lg bg-background/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground backdrop-blur-sm">
              Antes
            </div>
            <div className="absolute right-4 top-4 z-10 rounded-lg bg-accent/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground backdrop-blur-sm">
              Después
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
