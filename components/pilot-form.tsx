"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { type PilotLead, loadPilotLead, pilotMailto, savePilotLead } from "@/lib/storage";

const empty: Omit<PilotLead, "submittedAt"> = {
  name: "",
  email: "",
  company: "",
  trucks: "80",
  role: "Fleet / maintenance manager",
  message: "",
};

export function PilotForm() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<PilotLead | null>(null);

  useEffect(() => {
    const existing = loadPilotLead();
    if (existing) {
      setForm(existing);
      setSent(existing);
    }
  }, []);

  function update(field: keyof typeof empty, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) {
      setError("Name, work email, and company are required.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Use a real work email so we can send the pilot packet.");
      return;
    }
    const lead: PilotLead = { ...form, submittedAt: new Date().toISOString() };
    fetch("/api/pilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || "Could not save the lead on the server");
        }
        savePilotLead(lead);
        setSent(lead);
        setError("");
        window.location.href = pilotMailto(lead);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-paper-2 p-6">
        <p className="mono text-[11px] uppercase tracking-[0.16em] text-amber">Request captured</p>
        <h2 className="display mt-2 text-3xl">We have {sent.company} on the list.</h2>
        <p className="mt-3 text-sm text-ink/70">
          Your mail app should have opened with the pilot request. If it didn&apos;t, send the same note to{" "}
          <a className="underline" href={pilotMailto(sent)}>
            yashwanthsai525@gmail.com
          </a>
          .
        </p>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink/50">Contact</dt>
            <dd>
              {sent.name} · {sent.email}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/50">Fleet</dt>
            <dd>
              {sent.trucks} trucks · {sent.role}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard/" className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-paper">
            Open the live demo
          </Link>
          <button type="button" onClick={() => setSent(null)} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm">
            Edit request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[var(--line)] bg-paper-2 p-6">
      <p className="text-sm text-ink/60">Takes one minute. We reply with a 30-day plan, not a 40-slide deck.</p>
      <div className="mt-5 grid gap-4">
        <Field label="Your name" value={form.name} onChange={(value) => update("name", value)} />
        <Field label="Work email" type="email" value={form.email} onChange={(value) => update("email", value)} />
        <Field label="Company" value={form.company} onChange={(value) => update("company", value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Trucks in fleet" value={form.trucks} onChange={(value) => update("trucks", value)} />
          <Field label="Role" value={form.role} onChange={(value) => update("role", value)} />
        </div>
        <label className="block text-sm">
          <span className="text-ink/70">What hurts today</span>
          <textarea
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            rows={4}
            placeholder="Alerts sit in Samsara. Shop finds out after the load is late."
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-paper px-3 py-2 outline-none focus:border-amber"
          />
        </label>
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <button type="submit" className="mt-5 w-full rounded-full bg-amber py-3 text-sm font-semibold text-navy hover:bg-amber-2">
        Request the $3,500 pilot
      </button>
      <p className="mt-3 text-center text-xs text-ink/45">
        Or run the{" "}
        <Link href="/dashboard/" className="underline">
          Heartland Freight demo
        </Link>{" "}
        first.
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-ink/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-[var(--line)] bg-paper px-3 py-2 outline-none focus:border-amber"
      />
    </label>
  );
}
