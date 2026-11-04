"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/contentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonAvatar, SectionTitle } from "@/ui/components/primitives";
import { avatarSrc } from "@/lib/utils";
import { routes } from "@/config/routes";

const presets = ["aysel", "nigar", "elvin", "kamran", "sabina", "rashad", "gunel", "tural"];
const goals = ["travel", "work", "exams", "daily"] as const;
const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function ProfileView() {
  const t = useTranslations("profile");
  const common = useTranslations("common");
  const { user } = useAuth();
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const update = useMutation({
    mutationFn: profileService.update,
    onSuccess: (next) => {
      client.setQueryData(["me"], next);
      setMessage(common("saved"));
    },
  });
  const avatar = useMutation({
    mutationFn: async (action: { type: "preset"; preset: string } | { type: "file"; file: File } | { type: "delete" }) => {
      if (action.type === "preset") return profileService.preset(action.preset);
      if (action.type === "file") return profileService.upload(action.file);
      return profileService.removeAvatar();
    },
    onSuccess: (next) => client.setQueryData(["me"], next),
  });

  if (!user) return null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update.mutate({
      name: String(data.get("name")),
      bio: String(data.get("bio")),
      city: String(data.get("city")),
      level: String(data.get("level")),
      learningGoals: goals.filter((goal) => data.getAll("goals").includes(goal)),
    });
  }

  return (
    <div className="grid gap-6">
      <SectionTitle title={t("title")} text={t("text")} />
      <div className="flex items-center gap-4">
        <PersonAvatar src={avatarSrc(user)} alt={user.name} className="size-24" />
        <div>
          <p className="text-xl font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Link href={routes.security} className="text-sm font-semibold">{t("securityTitle")}</Link>
        </div>
      </div>
      <form onSubmit={onSubmit} className="glass grid gap-4 rounded-xl p-6">
        <div className="grid gap-2"><Label htmlFor="name">{common("you")}</Label><Input id="name" name="name" defaultValue={user.name} required /></div>
        <div className="grid gap-2"><Label htmlFor="bio">{t("bio")}</Label><Textarea id="bio" name="bio" defaultValue={user.bio} maxLength={280} /></div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">{t("city")}<Input name="city" defaultValue={user.city} /></label>
          <label className="grid gap-2 text-sm font-semibold">{common("level")}
            <select name="level" defaultValue={user.level} className="h-11 rounded-md border border-border bg-card px-3">
              {levels.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold">{t("goals")}</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {goals.map((goal) => (
              <label key={goal} className="flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm">
                <input type="checkbox" name="goals" value={goal} defaultChecked={user.learningGoals.includes(goal)} />
                {t(goal)}
              </label>
            ))}
          </div>
        </fieldset>
        {message && <p className="text-sm">{message}</p>}
        <Button type="submit">{common("save")}</Button>
      </form>
      <section className="glass rounded-xl p-6">
        <h2 className="font-semibold">{t("avatar")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("fileHint")}</p>
        <label className="mt-4 inline-flex cursor-pointer rounded-full bg-peach px-4 py-2 text-sm font-semibold text-ink">
          {t("upload")}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) avatar.mutate({ type: "file", file });
            }}
          />
        </label>
        <h3 className="mt-6 text-sm font-semibold">{t("presets")}</h3>
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {presets.map((preset) => (
            <button key={preset} type="button" onClick={() => avatar.mutate({ type: "preset", preset })} className="overflow-hidden rounded-full ring-2 ring-transparent hover:ring-lilac-deep">
              <img src={`/avatars/avatar-${preset}.jpg`} alt={preset} className="size-14 object-cover" />
            </button>
          ))}
        </div>
        <Button variant="outline" className="mt-4" onClick={() => avatar.mutate({ type: "delete" })}>{t("deleteAvatar")}</Button>
      </section>
    </div>
  );
}
