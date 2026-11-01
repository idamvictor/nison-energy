import { AccessoryProductCard } from "@/components/accessories/accessory-product-card";
import { CircuitProtectorCard } from "@/components/circuit-protectors/circuit-protector-card";
import { HomeProductSection } from "@/components/home/home-product-section";
import { getInstallerPicks } from "@/lib/catalog/queries";

/** Circuit protection and accessories ticked "Featured on home page" in the admin. */
export async function InstallerPicks() {
  const { circuit, accessories } = await getInstallerPicks();

  return (
    <HomeProductSection
      title="For Installers"
      subtitle="Trade-grade circuit protection, cables and accessories for every install."
      tone="tinted"
      links={[
        { href: "/circuit-protection", label: "Shop circuit protection" },
        { href: "/accessories", label: "Shop accessories" },
      ]}
    >
      {circuit.map((product) => (
        <CircuitProtectorCard key={product.id} variants={[product]} quickAdd />
      ))}
      {accessories.map((product) => (
        <AccessoryProductCard key={product.id} variants={[product]} quickAdd />
      ))}
    </HomeProductSection>
  );
}
