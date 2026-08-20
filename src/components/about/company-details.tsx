const details = [
  { label: "Legal name", value: "Nison Limited, trading as Nison Energy" },
  { label: "Registered in", value: "England and Wales, No. 16371062" },
  { label: "Registered address", value: "71–75 Shelton Street, Covent Garden, London, WC2H 9JQ" },
  { label: "VAT number", value: "495472057" },
];

export function CompanyDetails() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border p-6 sm:p-8">
          <p className="font-heading text-sm font-semibold text-foreground">
            Company Details
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {details.map((item) => (
              <div key={item.label}>
                <dt className="text-xs text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
