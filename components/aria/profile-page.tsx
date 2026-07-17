"use client";

import { useState, type FC } from "react";
import {
  BellIcon,
  CalendarIcon,
  CameraIcon,
  CrownIcon,
  KeyIcon,
  LogOutIcon,
  MailIcon,
  MapPinIcon,
  ShieldIcon,
  SparklesIcon,
  Trash2Icon,
  UserIcon,
  ZapIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ARIA_MODELS } from "@/lib/models";
import { useAriaStore } from "@/lib/aria-store";
import {
  DEFAULT_USAGE,
  getInitials,
  PLAN_DESCRIPTIONS,
  PLAN_LABELS,
} from "@/lib/profile";

export const ProfilePage: FC = () => {
  const profile = useAriaStore((s) => s.profile);
  const updateProfile = useAriaStore((s) => s.updateProfile);
  const modelId = useAriaStore((s) => s.modelId);
  const setModelId = useAriaStore((s) => s.setModelId);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const handleSave = () => {
    updateProfile(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const joinedDate = new Date(profile.joinedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
      {/* Hero */}
      <section className="bg-muted/30 border-border/50 mb-6 overflow-hidden rounded-2xl border md:rounded-3xl">
        <div className="from-primary/10 via-transparent to-transparent bg-gradient-to-br px-6 pb-6 pt-8 md:px-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
            <div className="group relative">
              <Avatar className="size-24 text-2xl md:size-28">
                <AvatarFallback className="bg-primary/15 text-primary font-semibold">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="bg-background/90 border-border/60 absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border shadow-sm transition-colors hover:bg-muted"
                aria-label="Change photo"
              >
                <CameraIcon className="size-4" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {profile.name}
                </h1>
                <PlanBadge plan={profile.plan} />
              </div>
              <p className="text-muted-foreground text-sm">@{profile.username}</p>
              <p className="text-muted-foreground mt-2 max-w-md text-sm">
                {profile.bio}
              </p>
              <div className="text-muted-foreground mt-3 flex flex-wrap items-center justify-center gap-3 text-xs sm:justify-start">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="size-3.5" />
                  {profile.location}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="size-3.5" />
                  Joined {joinedDate}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                setDraft(profile);
                setIsEditing(true);
              }}
            >
              Edit profile
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-6 grid grid-cols-3 gap-3">
        <StatCard
          label="Chats"
          value={DEFAULT_USAGE.totalChats}
          icon={SparklesIcon}
        />
        <StatCard
          label="Messages"
          value={DEFAULT_USAGE.totalMessages}
          icon={ZapIcon}
        />
        <StatCard
          label="Tokens"
          value={`${(DEFAULT_USAGE.tokensUsed / 1000).toFixed(1)}k`}
          icon={CrownIcon}
        />
      </section>

      {/* Plan */}
      <section className="bg-muted/20 border-border/50 mb-6 rounded-2xl border p-5 md:rounded-3xl md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
              Current plan
            </p>
            <h2 className="text-lg font-semibold">
              {PLAN_LABELS[profile.plan]}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {PLAN_DESCRIPTIONS[profile.plan]}
            </p>
          </div>
          <Button className="rounded-xl" size="sm">
            Upgrade plan
          </Button>
        </div>
      </section>

      {/* Settings */}
      <section id="settings" className="space-y-4">
        <h2 className="text-muted-foreground px-1 text-xs font-medium uppercase tracking-wider">
          Account
        </h2>

        <SettingsCard
          icon={UserIcon}
          title="Personal information"
          description="Update your name and public profile"
        >
          {isEditing ? (
            <div className="space-y-3">
              <ProfileField
                label="Full name"
                value={draft.name}
                onChange={(v) => setDraft({ ...draft, name: v })}
              />
              <ProfileField
                label="Username"
                value={draft.username}
                onChange={(v) => setDraft({ ...draft, username: v })}
              />
              <ProfileField
                label="Bio"
                value={draft.bio}
                onChange={(v) => setDraft({ ...draft, bio: v })}
                multiline
              />
              <ProfileField
                label="Location"
                value={draft.location}
                onChange={(v) => setDraft({ ...draft, location: v })}
              />
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="rounded-xl" onClick={handleSave}>
                  Save changes
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <InfoRow label="Name" value={profile.name} />
              <InfoRow label="Username" value={`@${profile.username}`} />
              <InfoRow label="Bio" value={profile.bio} />
              <InfoRow label="Location" value={profile.location} />
            </div>
          )}
        </SettingsCard>

        <SettingsCard
          icon={MailIcon}
          title="Email"
          description="Manage your email address"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">{profile.email}</span>
            <Button variant="outline" size="sm" className="rounded-xl">
              Change
            </Button>
          </div>
        </SettingsCard>

        <SettingsCard
          icon={SparklesIcon}
          title="Default model"
          description="Model used when starting new chats"
        >
          <div className="flex flex-wrap gap-2">
            {ARIA_MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => setModelId(model.id)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-sm transition-colors",
                  modelId === model.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {model.name}
              </button>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          icon={BellIcon}
          title="Notifications"
          description="Email and push notification preferences"
        >
          <div className="space-y-3">
            <ToggleRow label="Product updates" defaultChecked />
            <ToggleRow label="Weekly digest" />
            <ToggleRow label="Security alerts" defaultChecked />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={ShieldIcon}
          title="Security"
          description="Password and two-factor authentication"
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <KeyIcon className="size-3.5" />
              Change password
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <ShieldIcon className="size-3.5" />
              Enable 2FA
            </Button>
          </div>
        </SettingsCard>
      </section>

      {/* Danger zone */}
      <section className="mt-8 space-y-4">
        <h2 className="text-muted-foreground px-1 text-xs font-medium uppercase tracking-wider">
          Danger zone
        </h2>
        <div className="border-destructive/30 bg-destructive/5 rounded-2xl border p-5 md:rounded-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-destructive text-sm font-medium">
                Delete account
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Permanently remove your account and all data.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 rounded-xl"
            >
              <Trash2Icon className="size-3.5" />
              Delete account
            </Button>
          </div>
          <div className="border-destructive/20 mt-4 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Sign out of ARIA on this device.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <LogOutIcon className="size-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const PlanBadge: FC<{ plan: string }> = ({ plan }) => (
  <span
    className={cn(
      "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
      plan === "free" && "bg-muted text-muted-foreground",
      plan === "pro" && "bg-primary/15 text-primary",
      plan === "max" && "bg-amber-500/15 text-amber-400",
    )}
  >
    {plan}
  </span>
);

const StatCard: FC<{
  label: string;
  value: string | number;
  icon: FC<{ className?: string }>;
}> = ({ label, value, icon: Icon }) => (
  <div className="bg-muted/20 border-border/50 rounded-2xl border p-4 text-center">
    <Icon className="text-muted-foreground mx-auto mb-2 size-4" />
    <p className="text-xl font-semibold tabular-nums">{value}</p>
    <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
  </div>
);

const SettingsCard: FC<{
  icon: FC<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, description, children }) => (
  <div className="bg-muted/20 border-border/50 rounded-2xl border p-5 md:rounded-3xl">
    <div className="mb-4 flex items-start gap-3">
      <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-xl">
        <Icon className="text-muted-foreground size-4" />
      </div>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const ProfileField: FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}> = ({ label, value, onChange, multiline }) => (
  <label className="block">
    <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
      {label}
    </span>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="border-border/60 bg-background/50 focus:border-border w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border/60 bg-background/50 focus:border-border h-9 w-full rounded-xl border px-3 text-sm outline-none"
      />
    )}
  </label>
);

const InfoRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="text-muted-foreground w-20 shrink-0">{label}</span>
    <span className="min-w-0 flex-1">{value}</span>
  </div>
);

const ToggleRow: FC<{ label: string; defaultChecked?: boolean }> = ({
  label,
  defaultChecked,
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-3">
    <span className="text-sm">{label}</span>
    <input
      type="checkbox"
      defaultChecked={defaultChecked}
      className="accent-primary size-4 rounded"
    />
  </label>
);
