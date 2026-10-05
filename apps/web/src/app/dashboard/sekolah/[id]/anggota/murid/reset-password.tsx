"use client";

import { useActionState } from "react";
import { resetStudentPassword, type ResetState } from "./actions";

export function ResetPassword({ memberId }: { memberId: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetStudentPassword.bind(null, memberId), null);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      {state?.password ? <span className="num rounded-box border border-line bg-card px-2 py-1 text-sm font-bold" aria-live="polite">Sandi baru: {state.password}</span> : null}
      {state?.error ? <span className="text-sm text-bad" role="alert">{state.error}</span> : null}
      <button type="submit" disabled={pending} className="min-h-11 text-sm font-semibold text-pen underline disabled:opacity-60">{pending ? "Mengganti…" : "Atur ulang sandi"}</button>
    </form>
  );
}
