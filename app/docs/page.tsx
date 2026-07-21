import type { Metadata } from "next";
import { DocsShell } from "./docs-shell";

export const metadata: Metadata = {
  title: "Aria — Internal documentation",
  description:
    "Internal architecture documentation for Aria — research-first intelligence interface and BNII consumption surface.",
};

export default function DocsPage() {
  return <DocsShell />;
}
