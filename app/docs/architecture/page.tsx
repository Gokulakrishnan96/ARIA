import type { Metadata } from "next";
import { ArchitectureBoard } from "./architecture-board";

export const metadata: Metadata = {
  title: "Aria — Full architecture",
  description:
    "Internal full-product architecture for Aria and the BNII intelligence platform.",
};

export default function ArchitecturePage() {
  return <ArchitectureBoard />;
}
