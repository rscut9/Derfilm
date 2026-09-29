import { MediaCard } from "./_components/media-card";

const navigationItems = [
  "Inicio",
  "Categorías",
  "Actores",
  "Directores",
  "Añadir",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="w-full border-b border-white/10 bg-black px-6 py-4">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2"
        >
          <span className="font-bold tracking-wide text-red-500">DERFILM</span>
          {navigationItems.map((item) => (
            <span key={item} className="flex items-center gap-3">
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <span className="font-medium text-zinc-200">{item}</span>
            </span>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Muestra de tarjetas</h1>

        <div className="mt-8 grid gap-12 sm:grid-cols-2">
          <section aria-labelledby="peliculas-heading">
            <h2
              id="peliculas-heading"
              className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400"
            >
              Películas
            </h2>
            <MediaCard
              name="Transporter"
              imageSrc="/uploads/transporter.jpg"
            />
          </section>

          <section aria-labelledby="actores-heading">
            <h2
              id="actores-heading"
              className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400"
            >
              Actores
            </h2>
            <MediaCard
              name="Jason Statham"
              imageSrc="/uploads/jason-statham.webp"
            />
          </section>
        </div>
      </main>
    </div>
  );
}
