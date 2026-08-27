"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Cable, Inbox, LayoutDashboard, Newspaper, Zap, Package } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { adminLeads } from "@/lib/admin-leads";

const overviewLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
];

const catalogLinks = [
  { href: "/admin/residential", label: "Residential Chargers", icon: Zap },
  { href: "/admin/commercial", label: "Commercial Chargers", icon: Package },
  { href: "/admin/accessories", label: "Accessories", icon: Cable },
];

function navItemClass(active: boolean) {
  return cn(
    "border-l-2",
    active ? "border-primary" : "border-transparent"
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  const newLeads = adminLeads.filter((lead) => lead.status === "New").length;

  return (
    <Sidebar collapsible="offcanvas" className="border-sidebar-border">
      <SidebarHeader>
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-opacity hover:opacity-80"
        >
          <Image
            src="/ocunio-energy-logo.png"
            alt="Ocunio Energy"
            width={676}
            height={369}
            className="h-6 w-auto"
          />
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-primary uppercase">
            Admin
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      isActive={active}
                      className={navItemClass(active)}
                      render={<Link href={link.href} />}
                    >
                      <link.icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {catalogLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      isActive={active}
                      className={navItemClass(active)}
                      render={<Link href={link.href} />}
                    >
                      <link.icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/admin/blog")}
                  className={navItemClass(isActive("/admin/blog"))}
                  render={<Link href="/admin/blog" />}
                >
                  <Newspaper />
                  <span>Blog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Enquiries</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/admin/leads")}
                  className={navItemClass(isActive("/admin/leads"))}
                  render={<Link href="/admin/leads" />}
                >
                  <Inbox />
                  <span>Leads</span>
                </SidebarMenuButton>
                {newLeads > 0 && (
                  <SidebarMenuBadge className="text-primary">
                    {newLeads}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" target="_blank" />}>
              <ArrowUpRight />
              <span>View live site</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
