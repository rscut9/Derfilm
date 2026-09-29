import Link from "next/link";

const navigationItems = [
  { label: "Inicio", href: "/" },
  { label: "Categorías", href: "/categorias" },
  { label: "Actores", href: "/actores" },
  { label: "Directores" },
  { label: "Añadir", href: "/anadir" },
];

export function SiteHeader() {
  return (
    <header className="w-full border-b border-white/10 bg-black px-6 py-4">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2"
      >
        <Link
          href="/"
          className="font-bold tracking-wide text-red-500 transition hover:text-red-400"
        >
          DERFILM
        </Link>
        {navigationItems.map((item) => (
          <span key={item.label} className="flex items-center gap-3">
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            {item.href ? (
              <Link
                href={item.href}
                className="font-medium text-zinc-200 transition hover:text-white"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-zinc-500">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
