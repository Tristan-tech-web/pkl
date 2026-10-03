"use client";

import { useRef, useState, useTransition } from "react";
import { askTutor } from "@/app/dashboard/sekolah/[id]/belajar/[nodeId]/tutor-actions";
import { gsap, NO_REDUCE } from "@/lib/motion";
import { InlineMd } from "@/lib/md";
import { Button, ErrorNote, Input } from "@/components/ui";

type Msg = { role: "user" | "assistant"; content: string };
const STARTERS = ["Jelaskan dengan contoh lain", "Aku bingung bagian awalnya", "Beri aku petunjuk, bukan jawabannya"];

export function TutorChat({ schoolId, nodeId }: { schoolId: string; nodeId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();
  const [left, setLeft] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const list = useRef<HTMLOListElement>(null);

  const send = (content: string) => {
    const t = content.trim();
    if (!t || pending) return;
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next);
    setText("");
    setError(undefined);
    start(async () => {
      const res = await askTutor(schoolId, nodeId, next);
      if (res.ok) {
        setMsgs([...next, { role: "assistant", content: res.reply }]);
        setLeft(res.remaining);
        requestAnimationFrame(() => {
          const last = list.current?.lastElementChild;
          if (last && window.matchMedia(NO_REDUCE).matches) gsap.fromTo(last, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: "expo.out" });
          list.current?.scrollTo({ top: list.current.scrollHeight });
        });
      } else setError(res.error);
    });
  };

  return (
    <section aria-label="Tanya Pena" className="surface">
      <div className="border-b border-line px-4 py-3">
        <h2 className="font-display text-lg font-bold">Tanya Pena</h2>
        <p className="text-sm text-ink-soft">Pena kasih petunjuk dulu, jawaban kuis tidak. Jangan tulis data pribadi ya.</p>
      </div>
      <ol ref={list} aria-live="polite" className="max-h-80 space-y-3 overflow-y-auto px-4 py-3">
        {msgs.length === 0 ? (
          <li className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="press rounded-full border border-line px-3 py-1.5 text-sm hover:border-pen">
                {s}
              </button>
            ))}
          </li>
        ) : null}
        {msgs.map((m, i) => (
          <li key={i} className={m.role === "user" ? "ml-8 rounded-box bg-pen/10 px-3 py-2" : "mr-8 rounded-box border border-line px-3 py-2"}>
            <span className="sr-only">{m.role === "user" ? "Kamu: " : "Pena: "}</span>
            <span>{m.role === "assistant" ? <InlineMd text={m.content} /> : m.content}</span>
          </li>
        ))}
        {pending ? <li className="mr-8 text-ink-soft">Pena lagi berpikir…</li> : null}
      </ol>
      <div className="px-4 pb-1">
        <ErrorNote message={error} />
      </div>
      <form
        className="flex gap-2 p-4 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <label className="sr-only" htmlFor="tutor-q">Pertanyaan untuk tutor</label>
        <Input id="tutor-q" value={text} onChange={(e) => setText(e.target.value)} maxLength={600} placeholder="Tulis pertanyaanmu" autoComplete="off" />
        <Button type="submit" disabled={pending || !text.trim()}>Kirim</Button>
      </form>
      {left !== null ? <p className="num px-4 pb-3 text-xs text-ink-soft">Sisa jatah hari ini: {left}</p> : null}
    </section>
  );
}
