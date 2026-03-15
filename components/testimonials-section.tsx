"use client"

import { useEffect, useRef, useState } from "react"
import { Star, Truck } from "lucide-react"

const testimonials = [
  {
    name: "Carlos Ramírez",
    role: "Dueño de Flota - TransNorte",
    rating: 5,
    text: "Desde que usamos CochiLoco en nuestros 15 camiones, los clientes nos reconocen en la carretera. La imagen profesional ha mejorado nuestro negocio tremendamente.",
  },
  {
    name: "Miguel Ángel Torres",
    role: "Operador Independiente",
    rating: 5,
    text: "Llevo 20 años en el transporte y nunca había visto un producto así. Una sola aplicación y mi camión luce como recién salido de la agencia. Totalmente recomendado.",
  },
  {
    name: "Roberto Díaz",
    role: "Gerente de Mantenimiento - LogiMex",
    rating: 5,
    text: "La relación costo-beneficio es inigualable. CochiLoco protege la pintura de nuestros trailers contra el clima extremo y reduce los costos de mantenimiento estético.",
  },
]

export function TestimonialsSection() {
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
    <section id="testimonios" className="relative py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
            Testimonios
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl text-balance">
            Lo Que Dicen Nuestros Clientes
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <div
              key={testimonial.name}
              className={`rounded-xl border border-border bg-card p-8 transition-all duration-700 hover:border-primary/30 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-primary text-primary"
                  />
                ))}
              </div>
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                {`"${testimonial.text}"`}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
