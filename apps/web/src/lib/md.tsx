import type { ReactNode } from "react";

// Pemformat markdown mini untuk materi: judul ##, daftar - / 1., **tebal**, `kode`. Tanpa HTML mentah.
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    out.push(
      tok.startsWith("**") ? (
        <strong key={`${key}-${i++}`}>{tok.slice(2, -2)}</strong>
      ) : (
        <code key={`${key}-${i++}`} className="rounded-[4px] border border-line bg-card px-1.5 py-0.5 font-mono text-[0.92em]">
          {tok.slice(1, -1)}
        </code>
      ),
    );
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.split("\n");
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let n = 0;
  const flushPara = () => {
    if (para.length) blocks.push(<p key={`p${n++}`}>{inline(para.join(" "), `p${n}`)}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`l${n++}`} className={list.ordered ? "list-decimal pl-6" : "list-disc pl-6"}>
        {list.items.map((it, i) => (
          <li key={i} className="mt-1">
            {inline(it, `l${n}-${i}`)}
          </li>
        ))}
      </Tag>,
    );
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(
        <h2 key={`h${n++}`} className="mt-8 font-display text-2xl font-bold tracking-tight first:mt-0">
          {line.slice(3)}
        </h2>,
      );
      continue;
    }
    const bullet = /^- (.*)/.exec(line);
    const num = /^\d+\. (.*)/.exec(line);
    if (bullet || num) {
      flushPara();
      const ordered = !!num;
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? num)![1]);
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return <div className="space-y-4 text-lg leading-relaxed [&_p]:max-w-prose">{blocks}</div>;
}

// Format satu baris/paragraf saja (tebal dan kode), untuk balasan tutor.
export function InlineMd({ text }: { text: string }) {
  return <>{text.split("\n").map((line, i) => (
    <span key={i} className="block min-h-[1.25em]">{inline(line, `i${i}`)}</span>
  ))}</>;
}
