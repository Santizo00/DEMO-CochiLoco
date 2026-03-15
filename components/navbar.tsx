"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { LogOut, Menu, ShieldCheck, X } from "lucide-react"

import { AdminLoginModal } from "@/components/admin-login-modal"
import { useAdminSession } from "@/lib/admin-session"

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#producto", label: "Producto" },
  { href: "#galeria", label: "Galería" },
  { href: "#comparar", label: "Antes/Después" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#contacto", label: "Contacto" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const { session, isLoggedIn, logout } = useAdminSession()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-20 items-center justify-between lg:h-24">
            <a href="#inicio" className="flex items-center">
              <Image
                src="logo.jpeg"
                alt="Logo CochiLoco"
                width={220}
                height={220}
                priority
                className="h-14 w-auto object-contain lg:h-20"
              />
            </a>

            <div className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
              {isLoggedIn && session ? (
                <>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    Admin: {session.username}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-accent/40 hover:bg-secondary"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-accent/40 hover:bg-secondary"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Iniciar sesión
                </button>
              )}
              <a
                href="#contacto"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 glow-blue-sm"
              >
                Cotización
              </a>
            </div>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-foreground lg:hidden"
              aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileOpen && (
          <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              {isLoggedIn && session ? (
                <>
                  <div className="mt-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-medium text-foreground">
                    Admin activo: {session.username}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setIsMobileOpen(false)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginOpen(true)
                    setIsMobileOpen(false)
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Iniciar sesión
                </button>
              )}
              <a
                href="#contacto"
                onClick={() => setIsMobileOpen(false)}
                className="mt-2 rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Solicitar Cotización
              </a>
            </div>
          </div>
        )}
      </nav>

      <AdminLoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  )
}
