import Image from "next/image";

export function CategoryHero({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle: string;
  image: string;
}) {
  return (
    <div className="relative overflow-hidden bg-foreground">
      <div className="relative h-72 sm:h-80">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklch, black 88%, var(--primary) 12%) 0%, color-mix(in oklch, black 88%, var(--primary) 12%) 35%, transparent 80%)",
            opacity: 0.85,
          }}
        />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg text-white">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-white/75">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
