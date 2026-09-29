const navigationItems = [
  "Inicio",
  "Categorías",
  "Actores",
  "Directores",
  "Añadir",
];

export default function Home() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white px-6 py-4 text-zinc-950">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2"
      >
        <span className="font-bold tracking-wide">DERFILM</span>
        {navigationItems.map((item) => (
          <span key={item} className="flex items-center gap-3">
            <span aria-hidden="true" className="text-zinc-400">
              ·
            </span>
            <span className="font-medium">{item}</span>
          </span>
        ))}
      </nav>
    </header>
  );
}
