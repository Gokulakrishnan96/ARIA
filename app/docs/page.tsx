import type { Metadata } from "next";
import { DocsShell } from "./docs-shell";

export const metadata: Metadata = {
  title: "Aria Docs",
  description:
    "Canonical architecture documentation for Aria — the research-first intelligence interface.",
};

export default function DocsPage() {
  return <DocsShell />;
}
