import type { Metadata } from "next";

import { HardwareDetail, hardwareMetadata, hardwareStaticParams } from "@/components/charger-accessories/hardware-detail";

export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return hardwareStaticParams("Mount");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return hardwareMetadata("Mount", slug);
}

export default async function MountsAndPostsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <HardwareDetail category="Mount" slug={slug} />;
}
