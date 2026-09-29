import { MediaCard } from "./_components/media-card";
import { SiteHeader } from "./_components/site-header";
import { getActors, getMovies } from "@/lib/catalog";

export default function Home() {
  const movies = getMovies();
  const actors = getActors();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />

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
            <div className="flex flex-wrap gap-6">
              {movies.map((movie, index) => (
                <MediaCard
                  key={movie.id}
                  name={movie.name}
                  imageSrc={movie.imageSrc}
                  eager={index === 0}
                />
              ))}
            </div>
          </section>

          <section aria-labelledby="actores-heading">
            <h2
              id="actores-heading"
              className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400"
            >
              Actores
            </h2>
            <div className="flex flex-wrap gap-6">
              {actors.map((actor) => (
                <MediaCard
                  key={actor.id}
                  name={actor.name}
                  imageSrc={actor.imageSrc}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
