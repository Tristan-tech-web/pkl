"use client";

import { Mascot } from "@/components/three/mascot";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { submitQuizAction, type QuizResult } from "@/app/dashboard/sekolah/[id]/belajar/[nodeId]/kuis/actions";
import { gsap, NO_REDUCE, useGSAP } from "@/lib/motion";
import { IntegrityNotice } from "@/components/integrity-notice";
import { RewardBurst } from "@/components/motion/reward-burst";
import { XpCounter } from "@/components/motion/xp-counter";
import { Button, ErrorNote, Input, LinkButton } from "@/components/ui";

type Q = { id: string; kind: "mcq" | "multi" | "short"; prompt: string; options: string[] };
type Answer = number | string | number[];

// Maskot menyambut hasil: melompat riang bila lulus (mendengar peristiwa hadiah).
function MascotCheer({ passed }: { passed: boolean }) {
  useEffect(() => {
    if (!passed) return;
    const t = setTimeout(() => window.dispatchEvent(new Event("edusmart:reward")), 700);
    return () => clearTimeout(t);
  }, [passed]);
  return <div className="mb-2 flex justify-center"><Mascot size={150} /></div>;
}

export function QuizRunner({
  schoolId, nodeId, title, questions, nextHref, lessonHref,
}: { schoolId: string; nodeId: string; title: string; questions: Q[]; nextHref: string; lessonHref: string }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const stage = useRef<HTMLDivElement>(null);
  const blurs = useRef(0);
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") blurs.current += 1; };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);
  const q = questions[i];
  const cur = answers[q?.id];
  const answered = q?.kind === "short" ? typeof cur === "string" && cur.trim() !== "" : q?.kind === "multi" ? Array.isArray(cur) && cur.length > 0 : typeof cur === "number";

  // Soal berganti: kartu masuk dari kanan dengan sedikit overshoot.
  useGSAP(
    () => {
      if (result) return;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.fromTo(".q-card", { x: 36, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(1.4)" });
        gsap.fromTo(".q-opt", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out", stagger: 0.05, delay: 0.1 });
      });
      return () => mm.revert();
    },
    { scope: stage, dependencies: [i, !!result] },
  );

  // Hasil: bintang menghentak satu per satu, lalu blok hadiah.
  useGSAP(
    () => {
      if (!result) return;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const tl = gsap.timeline();
        tl.fromTo(".r-score", { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(2)" })
          .fromTo(".r-star.on", { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.5, ease: "back.out(3)", stagger: 0.22 }, "-=0.2")
          .fromTo(".r-reward", { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out", stagger: 0.1 }, "-=0.2");
        if (result.leveled_up) tl.fromTo(".r-level", { scale: 0.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "elastic.out(1,0.5)" }, "-=0.3");
      });
      return () => mm.revert();
    },
    { scope: stage, dependencies: [result] },
  );

  const set = (v: Answer) => setAnswers((a) => ({ ...a, [q.id]: v }));
  const submit = () =>
    start(async () => {
      setError(undefined);
      const res = await submitQuizAction(schoolId, nodeId, answers, blurs.current);
      if (res.ok) setResult(res.data);
      else setError(res.error);
    });
  const restart = () => {
    setResult(null);
    setAnswers({});
    setI(0);
  };

  if (result) {
    const byId = new Map(result.results.map((r) => [r.question_id, r]));
    return (
      <div ref={stage} className="relative">
        {result.passed ? <RewardBurst intensity={0.5 + result.stars * 0.35} /> : null}
        <MascotCheer passed={result.passed} />
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">{title}</p>
        <div className="r-score mt-2 flex items-end gap-4">
          <p className="num font-display text-7xl font-bold leading-none">{result.score}</p>
          <p className="pb-2 text-lg text-ink-soft">
            {result.correct} dari {result.total} benar
          </p>
        </div>
        <div className="mt-4 flex gap-1 text-5xl" role="img" aria-label={`${result.stars} dari 3 bintang`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={`r-star ${n <= result.stars ? "on" : ""}`} style={{ color: n <= result.stars ? "var(--star)" : "var(--line)" }}>
              ★
            </span>
          ))}
        </div>
        <IntegrityNotice schoolId={schoolId} integrity={result.integrity ?? null} />
        <p className="mt-3 text-lg font-semibold">
          {result.stars === 3 ? "Sempurna!" : result.stars === 2 ? "Bagus sekali." : result.stars === 1 ? "Lulus. Masih bisa lebih baik." : "Belum lulus. Baca materi lagi, lalu coba ulang."}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="r-reward surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">XP didapat</p>
            <p className="font-display text-3xl font-bold">
              <XpCounter to={result.xp_awarded} prefix="+" delay={0.9} />
            </p>
            {result.bonus > 0 ? <p className="text-sm text-ok">termasuk bonus nilai sempurna +{result.bonus}</p> : result.xp_awarded === 0 && result.passed ? <p className="text-sm text-ink-soft">Nilaimu tidak melampaui rekor sebelumnya.</p> : null}
          </div>
          <div className="r-reward surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Level {result.level}</p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-line bg-paper">
              <div className="h-full rounded-full bg-pen" style={{ width: `${Math.round((result.xp_into_level / result.xp_for_level) * 100)}%` }} />
            </div>
            <p className="num mt-1 text-sm text-ink-soft">
              {result.xp_into_level} / {result.xp_for_level} XP
            </p>
          </div>
          <div className="r-reward surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Beruntun</p>
            <p className="num font-display text-3xl font-bold">{result.streak} hari</p>
          </div>
        </div>

        {result.leveled_up ? (
          <p className="r-level mt-4 inline-block rounded-box border-2 border-pen bg-card px-4 py-2 font-display text-xl font-bold text-pen">
            Naik level! Sekarang level {result.level}
          </p>
        ) : null}
        {result.unlocked.length > 0 ? (
          <div className="r-reward mt-4 rounded-box border border-ok/40 bg-ok-bg p-4">
            <p className="font-semibold text-ok">Materi baru terbuka</p>
            <ul className="mt-1 list-disc pl-5">
              {result.unlocked.map((u) => (
                <li key={u.id}>{u.title}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href={nextHref}>Kembali ke peta belajar</LinkButton>
          <Button variant="ghost" onClick={restart}>Coba lagi</Button>
          <Link href={lessonHref} className="inline-flex min-h-11 items-center font-semibold text-pen underline">Baca materi</Link>
        </div>

        <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Pembahasan</h2>
        <ol className="mt-3 space-y-3">
          {questions.map((qq, n) => {
            const r = byId.get(qq.id);
            return (
              <li key={qq.id} className={`rounded-box border p-4 ${r?.correct ? "border-ok/40 bg-ok-bg" : "border-bad/40 bg-bad-bg"}`}>
                <p className="font-semibold">
                  {n + 1}. {qq.prompt}
                </p>
                <p className="mt-1 text-sm font-semibold">{r?.correct ? "Benar" : `Belum tepat. Jawaban: ${renderAnswer(qq, r?.correct_answer)}`}</p>
                <p className="mt-1 text-ink-soft">{r?.explanation}</p>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const last = i === questions.length - 1;
  return (
    <div ref={stage}>
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">{title}</p>
      <div className="mt-2 flex items-center gap-3" role="progressbar" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={i + 1} aria-label="Kemajuan kuis">
        <div className="flex flex-1 gap-1.5">
          {questions.map((_, n) => (
            <span key={n} className={`h-2 flex-1 rounded-full ${n < i ? "bg-ok" : n === i ? "bg-pen" : "bg-line"}`} />
          ))}
        </div>
        <span className="num text-sm text-ink-soft">
          {i + 1}/{questions.length}
        </span>
      </div>
      <div className="q-card mt-6 surface p-5">
        <h1 className="font-display text-2xl font-bold leading-snug tracking-tight">{q.prompt}</h1>
        <div className="mt-5 grid gap-3">
          {q.kind === "short" ? (
            <div className="q-opt">
              <label className="mb-1 block text-sm font-semibold" htmlFor="short">Jawabanmu</label>
              <Input id="short" value={typeof cur === "string" ? cur : ""} onChange={(e) => set(e.target.value)} autoComplete="off" inputMode="text" placeholder="Ketik jawaban" />
            </div>
          ) : (
            q.options.map((opt, n) => {
              const on = q.kind === "mcq" ? cur === n : Array.isArray(cur) && cur.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={on}
                  onClick={() => (q.kind === "mcq" ? set(n) : set(Array.isArray(cur) ? (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]) : [n]))}
                  className={`q-opt press flex min-h-12 items-center gap-3 rounded-box border-2 px-4 py-3 text-left text-lg ${on ? "border-pen bg-pen/10 font-semibold" : "border-line hover:border-pen"}`}
                >
                  <span aria-hidden="true" className={`grid size-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${on ? "border-pen bg-pen text-on-pen" : "border-line"}`}>
                    {String.fromCharCode(65 + n)}
                  </span>
                  {opt}
                </button>
              );
            })
          )}
        </div>
      </div>
      <div className="mt-4">
        <ErrorNote message={error} />
      </div>
      <div className="mt-4 flex justify-between gap-3">
        <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Sebelumnya</Button>
        {last ? (
          <Button disabled={pending || !questions.every((x) => answers[x.id] !== undefined && answers[x.id] !== "")} onClick={submit}>
            {pending ? "Menilai…" : "Kirim jawaban"}
          </Button>
        ) : (
          <Button disabled={!answered} onClick={() => setI(i + 1)}>Lanjut</Button>
        )}
      </div>
    </div>
  );
}

function renderAnswer(q: Q, a: unknown): string {
  if (q.kind === "short") return Array.isArray(a) ? String(a[0]) : String(a);
  if (typeof a === "number") return q.options[a] ?? "";
  if (Array.isArray(a)) return a.map((x) => q.options[Number(x)]).join(", ");
  return "";
}
