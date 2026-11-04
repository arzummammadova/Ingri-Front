import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function formatClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const m = String(Math.floor(safe / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function defaultAvatar(gender?: string) {
  if (gender === "female") return "/avatars/default-female.svg";
  if (gender === "male") return "/avatars/default-male.svg";
  return "/avatars/default-neutral.svg";
}

/** One avatar everywhere: uploaded image, then chosen preset, then a gender-based default. */
export function avatarSrc(person?: {
  avatarType?: string;
  avatarPreset?: string;
  avatarUrl?: string;
  gender?: string;
} | null) {
  if (!person) return defaultAvatar();
  if (person.avatarType === "upload" && person.avatarUrl) return person.avatarUrl;
  if (person.avatarType === "preset" && person.avatarPreset) return `/avatars/avatar-${person.avatarPreset}.jpg`;
  return defaultAvatar(person.gender);
}

export function scorePhrase(target: string, heard: string) {
  const norm = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z\s']/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  const expected = norm(target);
  const actual = new Set(norm(heard));
  if (!expected.length) return 0;
  const hits = expected.filter((word) => actual.has(word)).length;
  return Math.round((hits / expected.length) * 100);
}

export function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}
