import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <a href="#inicio" className="flex items-center">
            <Image
              src="logo.jpeg"
              alt="Logo El Cochi Loco"
              width={200}
              height={200}
              className="h-12 w-auto object-contain"
            />
          </a>
          <p className="text-center text-sm text-muted-foreground">
            {"2026 El Cochi Loco. Todos los derechos reservados."}
          </p>
        </div>
      </div>
    </footer>
  )
}
