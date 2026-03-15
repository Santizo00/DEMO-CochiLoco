"use client"

import { FormEvent, useEffect, useState } from "react"
import { LoaderCircle, LockKeyhole, X } from "lucide-react"

import { loginAdmin } from "@/lib/gallery-api"
import { saveAdminSession } from "@/lib/admin-session"

type AdminLoginModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminLoginModal({ open, onOpenChange }: AdminLoginModalProps) {
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setUsuario("")
      setPassword("")
      setError(null)
      setIsSubmitting(false)
    }
  }, [open])

  if (!open) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!usuario.trim() || !password) {
      setError("Ingresa tu usuario y contraseña.")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const session = await loginAdmin(usuario.trim(), password)
      saveAdminSession(session)
      onOpenChange(false)
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo validar el acceso."

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-background/90 p-4 py-8 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Inicio de sesión"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="my-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
              Acceso
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-foreground">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ingresa tus credenciales para continuar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Cerrar acceso"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Usuario</span>
            <input
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent"
              placeholder="Ingresa el usuario"
              autoComplete="username"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent"
              placeholder="Ingresa la contraseña"
              autoComplete="current-password"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <LockKeyhole className="h-4 w-4" />
                Ingresar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
