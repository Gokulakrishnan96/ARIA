"use client";

import { AppShell } from "@/components/aria/app-shell";
import { ProfilePage } from "@/components/aria/profile-page";
import { SidebarShell } from "@/components/aria/sidebar-shell";
import { AriaTopBar } from "@/components/aria/top-bar";

export default function Profile() {
  return (
    <AppShell
      sidebar={<SidebarShell />}
      topBar={<AriaTopBar title="Profile" />}
    >
      <ProfilePage />
    </AppShell>
  );
}
