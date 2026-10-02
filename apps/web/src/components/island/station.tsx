import "./island.css";

/** Satu pos di jalan setapak: simpul bernomor (dititi jalan), teks editorial, dan visual yang bisa disentuh. */
export function Station({ n, side = "left", title, body, visual }: { n: number; side?: "left" | "right"; title: React.ReactNode; body: React.ReactNode; visual: React.ReactNode }) {
  return (
    <article className="station" data-side={side}>
      <div className="station-node" data-station aria-hidden="true">{n}</div>
      <div className="station-text" data-reveal>
        <span className="station-num" aria-hidden="true">{String(n).padStart(2, "0")}</span>
        <h2 className="station-title">{title}</h2>
        <div className="station-body">{body}</div>
      </div>
      <div className="station-visual" data-reveal>{visual}</div>
    </article>
  );
}
