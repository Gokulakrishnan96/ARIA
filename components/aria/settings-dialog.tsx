"use client";

import { useEffect, useState, type FC } from "react";
import {
  DatabaseIcon,
  KeyIcon,
  MonitorIcon,
  MoonIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  Trash2Icon,
  UserIcon,
  ZapIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ARIA_MODELS } from "@/lib/models";
import { useAriaStore } from "@/lib/aria-store";
import { getInitials, PLAN_LABELS } from "@/lib/profile";

export type SettingsTab =
  | "general"
  | "account"
  | "data-control"
  | "model-api";

const TABS: {
  id: SettingsTab;
  label: string;
  icon: FC<{ className?: string }>;
}[] = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "account", label: "Account", icon: UserIcon },
  { id: "data-control", label: "Data Control", icon: DatabaseIcon },
  { id: "model-api", label: "Model API", icon: ZapIcon },
];

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: SettingsTab;
};

export const SettingsDialog: FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  initialTab = "general",
}) => {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setQuery("");
    }
  }, [open, initialTab]);

  const filteredTabs = TABS.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-popover border-border/50 flex h-[min(32rem,calc(100vh-1.5rem))] w-full max-w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-xl p-0 sm:max-w-2xl sm:rounded-2xl"
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage ARIA preferences, account, data, and model API settings.
        </DialogDescription>

        {/* Left nav */}
        <aside className="bg-muted/20 border-border/40 flex w-44 shrink-0 flex-col border-r p-2 max-sm:hidden">
          <div className="border-border/40 bg-background/30 mb-2 flex items-center gap-1.5 rounded-lg border px-2 py-1.5">
            <SearchIcon className="text-muted-foreground size-3 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="placeholder:text-muted-foreground/60 w-full bg-transparent text-[13px] outline-none"
            />
          </div>
          <p className="text-muted-foreground px-2 pb-1 text-[11px] font-medium tracking-wide uppercase">
            Settings
          </p>
          <nav className="flex flex-col gap-px">
            {filteredTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors",
                  tab === id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5 shrink-0 opacity-70" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main panel */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-border/40 flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-1 overflow-x-auto sm:hidden">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                    tab === id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <h2 className="hidden text-[13px] font-medium tracking-tight sm:block">
              {TABS.find((t) => t.id === tab)?.label}
            </h2>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 rounded-lg"
                  aria-label="Close settings"
                />
              }
            >
              <span className="text-base leading-none opacity-70">×</span>
            </DialogClose>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
            {tab === "general" && <GeneralPanel />}
            {tab === "account" && <AccountPanel />}
            {tab === "data-control" && <DataControlPanel />}
            {tab === "model-api" && <ModelApiPanel />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FieldLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-muted-foreground mb-1.5 block text-sm">{children}</label>
);

const FieldInput: FC<
  React.InputHTMLAttributes<HTMLInputElement> & { multiline?: never }
> = ({ className, ...props }) => (
  <input
    className={cn(
      "border-border/60 bg-muted/40 focus:border-border h-10 w-full rounded-xl border px-3 text-sm outline-none",
      className,
    )}
    {...props}
  />
);

const GeneralPanel: FC = () => {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("dark");

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-sm font-medium">Preferences</h3>
        <div className="space-y-4">
          <div>
            <FieldLabel>Appearance</FieldLabel>
            <div className="bg-muted/40 border-border/60 inline-flex rounded-xl border p-1">
              {(
                [
                  { id: "system", icon: MonitorIcon, label: "System" },
                  { id: "light", icon: SunIcon, label: "Light" },
                  { id: "dark", icon: MoonIcon, label: "Dark" },
                ] as const
              ).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  onClick={() => {
                    setTheme(id);
                    document.documentElement.classList.toggle(
                      "dark",
                      id === "dark" ||
                        (id === "system" &&
                          window.matchMedia("(prefers-color-scheme: dark)")
                            .matches),
                    );
                    if (id === "light") {
                      document.documentElement.classList.remove("dark");
                    }
                  }}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg transition-colors",
                    theme === id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Language</FieldLabel>
            <select className="border-border/60 bg-muted/40 focus:border-border h-10 w-full max-w-xs rounded-xl border px-3 text-sm outline-none">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Tamil</option>
              <option>Hindi</option>
            </select>
          </div>
          <div>
            <FieldLabel>Send message with</FieldLabel>
            <select className="border-border/60 bg-muted/40 focus:border-border h-10 w-full max-w-xs rounded-xl border px-3 text-sm outline-none">
              <option>Enter</option>
              <option>Cmd / Ctrl + Enter</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

const AccountPanel: FC = () => {
  const profile = useAriaStore((s) => s.profile);
  const updateProfile = useAriaStore((s) => s.updateProfile);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-4 text-sm font-medium">Profile</h3>
        <div className="mb-5 flex items-center gap-4">
          <Avatar className="size-16 text-lg">
            <AvatarFallback className="bg-primary/15 text-primary font-semibold">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{profile.name}</p>
            <p className="text-muted-foreground text-xs capitalize">
              {PLAN_LABELS[profile.plan]} plan
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <FieldLabel>Full name</FieldLabel>
            <FieldInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => updateProfile({ name })}
            />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <FieldInput value={profile.email} readOnly className="opacity-70" />
          </div>
          <div>
            <FieldLabel>About you</FieldLabel>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onBlur={() => updateProfile({ bio })}
              rows={3}
              className="border-border/60 bg-muted/40 focus:border-border w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>
      </section>
      <section className="border-border/50 border-t pt-5">
        <h3 className="mb-3 text-sm font-medium">Security</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
            <KeyIcon className="size-3.5" />
            Change password
          </Button>
        </div>
      </section>
    </div>
  );
};

const DataControlPanel: FC = () => {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-medium">Chat history</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Control how ARIA stores and uses your conversations.
        </p>
        <div className="space-y-3">
          <ToggleRow
            label="Save chat history"
            description="Keep past conversations in this browser"
            defaultChecked
          />
          <ToggleRow
            label="Improve the model"
            description="Allow anonymized chats to help improve ARIA"
            defaultChecked
          />
        </div>
      </section>
      <section className="border-border/50 border-t pt-5">
        <h3 className="mb-2 text-sm font-medium">Export & delete</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            Export data
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 rounded-xl"
          >
            <Trash2Icon className="size-3.5" />
            Delete all chats
          </Button>
        </div>
      </section>
    </div>
  );
};

const ModelApiPanel: FC = () => {
  const modelId = useAriaStore((s) => s.modelId);
  const setModelId = useAriaStore((s) => s.setModelId);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-medium">Default model</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Used for new chats unless you change it in the composer.
        </p>
        <div className="flex flex-col gap-2">
          {ARIA_MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => setModelId(model.id)}
              className={cn(
                "rounded-xl border px-3.5 py-3 text-left transition-colors",
                modelId === model.id
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/60 hover:border-border hover:bg-muted/30",
              )}
            >
              <p className="text-sm font-medium">{model.name}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {model.description}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

const ToggleRow: FC<{
  label: string;
  description: string;
  defaultChecked?: boolean;
}> = ({ label, description, defaultChecked }) => (
  <label className="border-border/50 bg-muted/20 flex cursor-pointer items-start justify-between gap-4 rounded-xl border px-3.5 py-3">
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
    </div>
    <input
      type="checkbox"
      defaultChecked={defaultChecked}
      className="accent-primary mt-1 size-4 shrink-0"
    />
  </label>
);
