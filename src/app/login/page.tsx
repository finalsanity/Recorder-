import Link from "next/link";
import { Activity, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--canvas)] p-6">
      <section className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-8 shadow-[var(--shadow-lg)] sm:p-10">
        <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[var(--accent)] text-white"><Activity size={19} /></span><span className="text-xl font-bold tracking-[-.04em]">trace</span></div>
        <div className="mt-14"><p className="text-sm font-bold text-[var(--accent-dark)]">QA evidence, without the busywork.</p><h1 className="mt-3 text-4xl font-bold leading-tight tracking-[-.055em]">Your evidence workspace starts here.</h1><p className="mt-4 text-sm leading-6 text-[var(--muted)]">Sign in with your company Microsoft account to capture and share evidence securely.</p></div>
        <Link href="/" className="mt-8 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 text-sm font-bold text-white transition-colors hover:bg-[#2b383e]"><ShieldCheck size={17} /> Continue with Microsoft <ArrowRight size={16} /></Link>
        <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">Your password is handled by Microsoft Entra ID.<br />Trace never sees or stores it.</p>
      </section>
    </main>
  );
}
