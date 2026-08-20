export function getMapsDirectionsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function MapEmbed({
  address,
  className,
  title,
}: {
  address: string;
  className?: string;
  title: string;
}) {
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <iframe
      src={embedUrl}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={className}
      style={{ border: 0 }}
    />
  );
}
