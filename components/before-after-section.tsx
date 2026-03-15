"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"

export function BeforeAfterSection() {
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

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
              src="images/after-truck.jpg"
              alt="Camión después de aplicar CochiLoco"
              fill
              className="object-cover"
              quality={85}
            />

            {/* Before (clipped top layer) */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <Image
                src="images/before-truck.jpg"
                alt="Camión antes de aplicar CochiLoco"
                fill
                className="object-cover"
                quality={85}
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
