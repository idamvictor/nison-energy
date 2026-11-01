import { ProductCard } from "@/components/shared/product-card";
import { HomeProductSection } from "@/components/home/home-product-section";
import { getBudgetChargers } from "@/lib/catalog/queries";

export async function BudgetChargers() {
  // Under £400 inc VAT — the same bucket as the catalogue's "Under £400" filter.
  const products = await getBudgetChargers(400);

  return (
    <HomeProductSection
      title="Best Budget Chargers"
      subtitle="Quality smart chargers for £400 and under."
      links={[{ href: "/home-charging?price=under-400", label: "View all under £400" }]}
    >
      {products.map((product) => (
        <ProductCard key={product.id} variants={[product]} quickAdd />
      ))}
    </HomeProductSection>
  );
}
