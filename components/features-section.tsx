"use client"

import { useEffect, useRef, useState } from "react"
import { ShieldCheck, Sparkles, HandMetal } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Protección Extrema",
    subtitle: "contra clima",
    description:
      "Barrera avanzada contra lluvia, sol, polvo y contaminantes industriales. Tu camión protegido las 24 horas.",
  },
  {
    icon: Sparkles,
    title: "Brillo Espejo",
    subtitle: "de larga duración",
    description:
      "Acabado de nivel showroom que dura semanas. Reflejo perfecto que impresiona en cada ruta.",
  },
  {
    icon: HandMetal,
    title: "Fácil Aplicación",
    subtitle: "profesional",
    description:
      "Fórmula diseñada para aplicación rápida. Resultados profesionales sin necesidad de equipos especiales.",
  },
]

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="producto" className="relative py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
            El Producto
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl text-balance">
            Rendimiento Superior
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Tecnología avanzada diseñada específicamente para las exigencias del transporte pesado.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group rounded-xl border border-border bg-card p-8 transition-all duration-700 hover:border-primary/40 hover:glow-blue-sm ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-foreground">
                {feature.title}
              </h3>
              <p className="mb-3 text-sm font-medium text-accent">{feature.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
