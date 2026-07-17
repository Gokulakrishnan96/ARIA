export type UserPlan = "free" | "pro" | "max";

export type UserProfile = {
  name: string;
  email: string;
  username: string;
  bio: string;
  location: string;
  plan: UserPlan;
  joinedAt: string;
};

export type UsageStats = {
  totalChats: number;
  totalMessages: number;
  tokensUsed: number;
};

export const DEFAULT_PROFILE: UserProfile = {
  name: "Gokulakrishnan",
  email: "gokul@aria.ai",
  username: "gokul",
  bio: "Building with AI. Exploring ideas, shipping products, and learning every day.",
  location: "India",
  plan: "free",
  joinedAt: "2026-01-15",
};

export const DEFAULT_USAGE: UsageStats = {
  totalChats: 24,
  totalMessages: 186,
  tokensUsed: 48200,
};

export const PLAN_LABELS: Record<UserPlan, string> = {
  free: "Free",
  pro: "Pro",
  max: "Max",
};

export const PLAN_DESCRIPTIONS: Record<UserPlan, string> = {
  free: "Basic access with daily limits",
  pro: "Higher limits and priority models",
  max: "Unlimited access and fastest models",
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
