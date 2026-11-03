import type { Metadata } from "next";
import { SimulatorView } from "@/components/simulator/SimulatorView";

export const metadata: Metadata = {
  title: "Investing simulator",
  description: "See how a starting amount and monthly contributions could grow, after fees and inflation.",
};

export default function SimulatorPage() {
  return <SimulatorView />;
}
