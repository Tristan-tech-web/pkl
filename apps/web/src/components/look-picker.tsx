"use client";

import { useState } from "react";
import { LookPreview } from "@/components/look-preview";
import { Button } from "@/components/ui";
import { DENSITIES, EXPERIENCES, EXPERIENCE_INFO, FONT_SIZES, MOTIONS, type Experience, type Prefs } from "@/lib/appearance";
import { themeById } from "@/lib/themes";

type Props = {
  action: (fd: FormData) => void; resetAction: () => void;
  initial: Prefs; effective: { theme: string; experience: Experience };
  usableThemes: string[]; canPick: boolean; allow3d: boolean; allowSound: boolean;
  brand: { pen: string; penStrong: string; onPen: string; hi: string } | null; schoolId?: string | null;
};
const FS_LABEL = { normal: "Normal", besar: "Besar", "sangat-besar": "Sangat besar" } as const;
const DENS_LABEL = { rapat: "Rapat", normal: "Normal", longgar: "Longgar" } as const;
const MOTION_LABEL = { penuh: "Penuh", kurangi: "Dikurangi" } as const;

export function LookPicker({ action, resetAction, initial, effective, usableThemes, canPick, allow3d, allowSound, brand, schoolId }: Props) {
  const [theme, setTheme] = useState(initial.theme ?? effective.theme);
  const [experience, setExperience] = useState<Experience>(initial.experience ?? effective.experience);
  const [fontSize, setFontSize] = useState(initial.fontSize ?? "normal");
  const [density, setDensity] = useState(initial.density ?? "normal");
  const [motion, setMotion] = useState(initial.motion ?? (effective.experience === "ringkas" ? "kurangi" : "penuh"));
  const [scene3d, setScene3d] = useState(initial.scene3d ?? "auto");
  const [sound, setSound] = useState(initial.sound ?? effective.experience !== "ringkas");
  const [relaxed, setRelaxed] = useState(initial.relaxed ?? false);
  const shownTheme = usableThemes.includes(theme) ? theme : effective.theme;

  const Radio = ({ name, value, current, set, children, disabled }: { name: string; value: string; current: string; set: (v: never) => void; children: React.ReactNode; disabled?: boolean }) => (
    <label className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-btn border border-line bg-card px-3 has-[:checked]:border-pen has-[:checked]:bg-pen/10 ${disabled ? "opacity-50" : ""}`}>
      <input type="radio" name={name} value={value} checked={current === value} disabled={disabled} onChange={() => set(value as never)} className="size-4" /> {children}
    </label>
  );

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {schoolId ? <input type="hidden" name="school" value={schoolId} /> : null}
      <div className="space-y-8">
        {!canPick ? <p className="rounded-box border border-warn/40 bg-warn-bg p-3 text-sm text-warn">Tampilan untuk akunmu diatur oleh sekolah. Pilihan di bawah dikunci.</p> : null}

        <fieldset disabled={!canPick} className="space-y-3">
          <legend className="font-display text-xl font-bold">Gaya</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {EXPERIENCES.map((e) => (
              <label key={e} className="flex cursor-pointer flex-col gap-2 rounded-box border border-line bg-card p-3 has-[:checked]:border-pen has-[:checked]:ring-2 has-[:checked]:ring-pen">
                <span className="flex items-center gap-2 font-semibold"><input type="radio" name="experience" value={e} checked={experience === e} onChange={() => setExperience(e)} className="size-4" /> {EXPERIENCE_INFO[e].label}</span>
                <span className="text-sm text-ink-soft">{EXPERIENCE_INFO[e].blurb}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset disabled={!canPick} className="space-y-3">
          <legend className="font-display text-xl font-bold">Tema</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {usableThemes.map((id) => {
              const th = themeById(id);
              return (
                <label key={id} className="cursor-pointer rounded-box has-[:checked]:ring-2 has-[:checked]:ring-pen has-[:focus-visible]:ring-2">
                  <input type="radio" name="theme" value={id} checked={shownTheme === id} onChange={() => setTheme(id)} className="sr-only" />
                  <LookPreview theme={id} experience={experience} brand={id === "warna-sekolah" ? brand : null} />
                  <span className="mt-1 block px-1 text-sm font-semibold">{th.label}<span className="block text-xs font-normal text-ink-soft">{th.blurb}</span></span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset disabled={!canPick} className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-2 font-display text-xl font-bold">Kenyamanan</legend>
          <div><p className="mb-1 text-sm font-semibold">Ukuran huruf</p><div className="space-y-2">{FONT_SIZES.map((v) => <Radio key={v} name="font_size" value={v} current={fontSize} set={setFontSize as (v: never) => void}>{FS_LABEL[v]}</Radio>)}</div></div>
          <div><p className="mb-1 text-sm font-semibold">Kepadatan</p><div className="space-y-2">{DENSITIES.map((v) => <Radio key={v} name="density" value={v} current={density} set={setDensity as (v: never) => void}>{DENS_LABEL[v]}</Radio>)}</div></div>
          <div><p className="mb-1 text-sm font-semibold">Gerak</p><div className="space-y-2">{MOTIONS.map((v) => <Radio key={v} name="motion" value={v} current={motion} set={setMotion as (v: never) => void}>{MOTION_LABEL[v]}</Radio>)}</div></div>
        </fieldset>

        <fieldset disabled={!canPick} className="space-y-2">
          <legend className="mb-1 font-display text-xl font-bold">Lainnya</legend>
          {allow3d && experience !== "ringkas" ? <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="scene3d_on" checked={scene3d !== "mati"} onChange={(e) => setScene3d(e.target.checked ? "auto" : "mati")} className="size-4" /> Tampilkan benda 3D (otomatis dimatikan di perangkat lemah)</label> : null}
          {allowSound ? <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="sound" checked={sound} onChange={(e) => setSound(e.target.checked)} className="size-4" /> Suara efek</label> : null}
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="relaxed" checked={relaxed} onChange={(e) => setRelaxed(e.target.checked)} className="size-4" /> Mode santai (tanpa tekanan streak)</label>
        </fieldset>
        <input type="hidden" name="scene3d" value={scene3d} />

        {canPick ? (
          <div className="flex flex-wrap gap-3">
            <Button type="submit">Simpan tampilan</Button>
            <Button type="submit" variant="ghost" formAction={resetAction} formNoValidate>Kembalikan ke bawaan</Button>
          </div>
        ) : null}
      </div>

      <aside aria-label="Pratinjau" className="lg:sticky lg:top-4 lg:self-start">
        <p className="mb-2 text-sm font-semibold">Pratinjau</p>
        <LookPreview theme={shownTheme} experience={experience} brand={shownTheme === "warna-sekolah" ? brand : null} className="p-4" />
      </aside>
    </form>
  );
}
