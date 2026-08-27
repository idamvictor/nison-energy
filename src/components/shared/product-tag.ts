const tagStyles: Record<string, string> = {
  "Ocunio recommends": "bg-primary text-primary-foreground border-transparent",
  "Free UK delivery": "bg-success text-success-foreground border-transparent",
  "3 year warranty": "bg-success text-success-foreground border-transparent",
};

export function tagClass(tag: string) {
  return tagStyles[tag] ?? "bg-background/90 text-foreground";
}
