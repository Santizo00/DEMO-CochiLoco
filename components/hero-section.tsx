"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section id="inicio" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Image
        src="/images/hero-truck.jpg"
        alt="Camión brillante con acabado espejo"
        fill
        className="object-cover"
        priority
        quality={90}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Cera Premium para Camiones
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold uppercase leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
            Haz que tu camión brille{" "}
            <span className="text-primary text-glow">como nunca antes</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            Cera profesional de alto rendimiento para acabados espejo
          </p>
        </div>

        <div
          className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-1000 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <a
            href="#galeria"
            className="group rounded-lg bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:opacity-90 glow-blue"
          >
            Ver Galería
          </a>
          <a
            href="#galeria"
            className="rounded-lg border border-border bg-secondary/50 px-8 py-4 text-sm font-bold uppercase tracking-wider text-foreground backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-secondary"
          >
            Subir Mi Resultado
          </a>
        </div>
      </div>

      <a
        href="#producto"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground transition-colors hover:text-primary"
        aria-label="Desplazar hacia abajo"
      >
        <ChevronDown className="h-8 w-8" />
      </a>
    </section>
  )
}
