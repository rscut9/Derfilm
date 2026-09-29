import Image from "next/image";

type MediaCardProps = {
  name: string;
  imageSrc: string;
};

export function MediaCard({ name, imageSrc }: MediaCardProps) {
  return (
    <figure className="group w-full max-w-48">
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-zinc-800 shadow-lg ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-black/40">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 45vw, 192px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <figcaption className="mt-3 truncate text-base font-semibold text-white">
        {name}
      </figcaption>
    </figure>
  );
}
