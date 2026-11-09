/** A real phone capture from the app, swapped for the dark version when the
 *  visitor's system is in dark mode. */
export default function Screen({
  name,
  alt,
  className = "screen",
  priority = false,
}: {
  name: "alarm" | "learn" | "task" | "gym";
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <picture>
      <source srcSet={`/screens/${name}-dark.webp`} media="(prefers-color-scheme: dark)" />
      <img
        src={`/screens/${name}-light.webp`}
        alt={alt}
        width={600}
        height={1206}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}
