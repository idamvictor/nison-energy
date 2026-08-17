export type Product = {
  id: string;
  name: string;
  spec: string;
  price: string;
  badge?: string;
  tone: "teal" | "orange" | "graphite";
};

export const products: Product[] = [
  {
    id: "volt-pro-5m-black",
    name: "Volt Pro 7kW Tethered",
    spec: "7.4kW · Type 2 · 5m cable · Black",
    price: "£799",
    badge: "Best seller",
    tone: "teal",
  },
  {
    id: "volt-pro-75m-black",
    name: "Volt Pro 7kW Tethered",
    spec: "7.4kW · Type 2 · 7.5m cable · Black",
    price: "£829",
    tone: "teal",
  },
  {
    id: "volt-pro-5m-graphite",
    name: "Volt Pro 7kW Tethered",
    spec: "7.4kW · Type 2 · 5m cable · Graphite",
    price: "£799",
    tone: "graphite",
  },
  {
    id: "volt-pro-5m-white",
    name: "Volt Pro 7kW Tethered",
    spec: "7.4kW · Type 2 · 5m cable · White",
    price: "£799",
    tone: "graphite",
  },
  {
    id: "arc-smart-untethered",
    name: "Arc Smart 7kW Untethered",
    spec: "7.4kW · Type 2 socket · App control",
    price: "£649",
    badge: "New",
    tone: "orange",
  },
  {
    id: "arc-smart-6m",
    name: "Arc Smart 7kW Tethered",
    spec: "7.4kW · Type 2 · 6m cable · App control",
    price: "£749",
    tone: "orange",
  },
  {
    id: "pulse-pod",
    name: "Pulse Pod EV Charger",
    spec: "7.4kW · Compact wall unit · Type 2",
    price: "£599",
    tone: "teal",
  },
  {
    id: "pulse-pod-pro",
    name: "Pulse Pod Pro",
    spec: "7.4kW · Untethered · App-enabled",
    price: "£699",
    badge: "OZEV approved",
    tone: "orange",
  },
];
