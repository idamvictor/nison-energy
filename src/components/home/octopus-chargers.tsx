import { ProductCard } from "@/components/shared/product-card";
import { HomeProductSection } from "@/components/home/home-product-section";
import { getTariffChargers } from "@/lib/catalog/queries";

export async function OctopusChargers() {
  const products = await getTariffChargers("Octopus Energy");

  return (
    <HomeProductSection
      title="Best for Intelligent Octopus Tariff"
      subtitle="Smart chargers that work with Octopus Energy's cheap overnight EV rate."
      tone="tinted"
      links={[{ href: "/home-charging", label: "View all residential chargers" }]}
    >
      {products.map((product) => (
        <ProductCard key={product.id} variants={[product]} quickAdd ozevCta />
      ))}
    </HomeProductSection>
  );
}
