import Link from "next/link";
import type { ComponentProps } from "react";

const field =
  "field w-full rounded-btn border border-line bg-card px-3 py-2.5 text-base text-ink placeholder:text-ink-soft/70 outline-none focus:border-pen focus:ring-2 focus:ring-pen/30";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${field} ${props.className ?? ""}`} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={`${field} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${field} ${props.className ?? ""}`} />;
}

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1 block text-sm font-semibold">
      {children}
      {hint ? <span className="ml-2 font-normal text-ink-soft">{hint}</span> : null}
    </span>
  );
}

const solid = "btn-solid";
const ghost = "btn-ghost";
const base = "press inline-flex min-h-11 items-center justify-center rounded-btn px-5 font-semibold";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "ghost" }) {
  return (
    <button {...props} className={`${base} ${variant === "primary" ? solid : ghost} disabled:opacity-60 ${className}`} />
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  return (
    <Link href={href} className={`${base} ${variant === "primary" ? solid : ghost}`}>
      {children}
    </Link>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-box border border-bad/30 bg-bad-bg px-3 py-2 text-sm text-bad">
      {message}
    </p>
  );
}

export function InfoNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className="rounded-box border border-ok/30 bg-ok-bg px-3 py-2 text-sm text-ok">
      {message}
    </p>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`surface p-5 ${className}`}>{children}</div>;
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="shrink-0">
        <rect x="0.5" y="0.5" width="27" height="27" rx="3" fill="var(--card)" stroke="var(--line)" />
        <path d="M0 14H28M14 0V28" stroke="var(--grid)" strokeWidth="1" />
        <path d="M4 5C8 22 12 24 14 24C16 24 20 22 24 5" fill="none" stroke="var(--pen)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">EduSmart</span>
    </span>
  );
}
