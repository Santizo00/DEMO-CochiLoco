"use client"

import { Phone } from "lucide-react"

export function ContactSection() {
  const normalizeGtPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "")
    return digits.startsWith("502") ? digits.slice(3) : digits
  }

  const buildWhatsAppUrl = (localNumber: string) => {
    const internationalNumber = `502${localNumber}`
    return `https://api.whatsapp.com/send?phone=${internationalNumber}`
  }

  return (
    <section id="contacto" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
              Contacto
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl text-balance">
              Contáctanos Directamente
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
              Nuestro equipo está listo para atenderte con los mejores productos.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                name: "Melvin Ozorio",
                phone: "(502) 3672-9387",
                detail: "Fabricación de productos",
              },
              {
                name: "Hugo Robledo",
                phone: "(502) 4343-4097",
                detail: "Pulido tipo espejo",
              },
            ].map((contact) => {
              const localNumber = normalizeGtPhone(contact.phone)
              const internationalNumber = `502${localNumber}`

              return (
                <div
                  key={contact.name}
                  className="rounded-2xl border border-border bg-card p-8 transition-all hover:border-accent/60 hover:shadow-lg"
                >
                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-accent mb-4">
                  {contact.name}
                </h3>
                <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {contact.detail}
                </p>
                <div className="space-y-4">
                  <a
                    href={`tel:+${internationalNumber}`}
                    className="flex items-center gap-3 rounded-lg bg-primary/10 p-4 transition-all hover:bg-primary/20"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="text-lg font-bold text-foreground">{contact.phone}</p>
                    </div>
                  </a>
                  <a
                    href={buildWhatsAppUrl(localNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wider text-accent-foreground transition-all hover:opacity-90"
                  >
                    💬 Contactar por WhatsApp
                  </a>
                </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
