import { AccessoryProductCard } from "@/components/accessories/accessory-product-card";
import { CableCard } from "@/components/cables/cable-card";
import { CircuitProtectorCard } from "@/components/circuit-protectors/circuit-protector-card";
import { HomeProductSection } from "@/components/home/home-product-section";
import { getInstallerPicks } from "@/lib/catalog/queries";

/**
 * Install kits and circuit protection ticked "Featured on home page" in the
 * admin, plus the accessories listed in getInstallerPicks.
 */
export async function InstallerPicks() {
  const { kits, accessories, circuit } = await getInstallerPicks();

  return (
    <HomeProductSection
      title="For Installers"
      subtitle="Trade-grade EV install kits and circuit protection for every install."
      tone="tinted"
      links={[
        { href: "/circuit-protection", label: "Shop circuit protection" },
        { href: "/cables?type=ev-ultra-install-kit", label: "Shop install kits" },
      ]}
    >
      {kits.map((product) => (
        <CableCard key={product.id} variants={[product]} quickAdd />
      ))}
      {accessories.map((product) => (
        <AccessoryProductCard key={product.id} variants={[product]} quickAdd />
      ))}
      {circuit.map((product) => (
        <CircuitProtectorCard key={product.id} variants={[product]} quickAdd />
      ))}
    </HomeProductSection>
  );
}
