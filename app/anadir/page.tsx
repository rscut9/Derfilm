import { SiteHeader } from "@/app/_components/site-header";
import { ActorForm } from "./actor-form";

export default function AddPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
          Añadir
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Nuevo actor</h1>
        <p className="mt-3 text-zinc-400">
          Guarda el nombre y una fotografía para incorporarlo al catálogo.
        </p>

        <ActorForm />
      </main>
    </div>
  );
}
