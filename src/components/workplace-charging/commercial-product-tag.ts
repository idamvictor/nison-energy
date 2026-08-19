const tagStyles: Record<string, string> = {
  "Nison recommends": "bg-primary text-primary-foreground border-transparent",
  "Dual outlet": "bg-accent text-accent-foreground border-transparent",
  "5 year warranty": "bg-success text-success-foreground border-transparent",
};

export function tagClass(tag: string) {
  return tagStyles[tag] ?? "bg-background/90 text-foreground";
}
