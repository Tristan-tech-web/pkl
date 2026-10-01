export function Stars({ n, size = "text-lg" }: { n: number; size?: string }) {
  return (
    <span className={`${size} tracking-tight`} role="img" aria-label={`${n} dari 3 bintang`}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ color: i <= n ? "var(--star)" : "var(--line)" }}>
          ★
        </span>
      ))}
    </span>
  );
}
