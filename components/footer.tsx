import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-wider text-foreground">
              BrilloMax<span className="text-primary"> Pro</span>
            </span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {"2026 BrilloMax Pro. Todos los derechos reservados. Sitio demo."}
          </p>
        </div>
      </div>
    </footer>
  )
}
