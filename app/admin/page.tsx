"use client";

import { useState } from "react";
import Link from "next/link";

type State = "idle" | "loading" | "preview" | "committing" | "done" | "error";

export default function AdminPage() {
  const [passphrase, setPassphrase] = useState("");
  const [concept, setConcept] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<State>("idle");
  const [preview, setPreview] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!passphrase.trim() || !concept.trim()) return;
    setState("loading");
    setError("");

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase, concept, notes }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || `Error ${res.status}`);
      setState("error");
      return;
    }

    setPreview(data.markdown);
    setSlug(data.slug);
    setState("preview");
  }

  async function handleCommit() {
    setState("committing");

    const res = await fetch("/api/generate", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase, slug, markdown: preview }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || `Error ${res.status}`);
      setState("error");
      return;
    }

    setState("done");
  }

  function handleReset() {
    setState("idle");
    setConcept("");
    setNotes("");
    setPreview("");
    setSlug("");
    setError("");
  }

  const inputStyle = {
    background: "var(--background)",
    borderColor: "var(--border)",
    color: "var(--foreground)",
  };

  return (
    <main className="flex-1 px-4 py-10 max-w-xl mx-auto w-full">
      <nav className="mb-10">
        <Link
          href="/"
          className="text-sm hover:opacity-60 transition-opacity"
          style={{ color: "var(--muted)" }}
        >
          ← Library
        </Link>
      </nav>

      <h1 className="text-xl font-semibold mb-8">Add Concept</h1>

      {state === "done" ? (
        <div className="space-y-4">
          <p className="text-sm">
            Article committed to GitHub. It will be live after Vercel rebuilds
            (~1–2 min).
          </p>
          <div className="flex gap-6">
            <Link href="/" className="text-sm underline">
              Back to library
            </Link>
            <button onClick={handleReset} className="text-sm underline">
              Add another
            </button>
          </div>
        </div>
      ) : state === "preview" || state === "committing" ? (
        <div className="space-y-6">
          <div
            className="p-4 rounded-lg text-sm whitespace-pre-wrap font-mono overflow-auto max-h-[60vh] text-xs leading-relaxed"
            style={{ background: "var(--border)" }}
          >
            {preview}
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Review the article above. Commit it to GitHub, or go back to
            regenerate.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCommit}
              disabled={state === "committing"}
              className="px-4 py-2.5 text-sm font-medium rounded-lg disabled:opacity-50"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
              }}
            >
              {state === "committing" ? "Committing…" : "Commit to GitHub"}
            </button>
            <button
              onClick={() => setState("idle")}
              className="px-4 py-2.5 text-sm rounded-lg"
              style={{ background: "var(--border)" }}
            >
              Regenerate
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label
              className="block text-sm mb-1.5 font-medium"
              style={{ color: "var(--muted)" }}
            >
              Passphrase
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border"
              style={inputStyle}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label
              className="block text-sm mb-1.5 font-medium"
              style={{ color: "var(--muted)" }}
            >
              Concept name
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border"
              style={inputStyle}
              placeholder="e.g. Hilbert's Hotel"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>

          <div>
            <label
              className="block text-sm mb-1.5 font-medium"
              style={{ color: "var(--muted)" }}
            >
              Context{" "}
              <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border resize-none"
              style={inputStyle}
              placeholder="Angles to cover, connections to make, anything specific you want included…"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={
              state === "loading" ||
              !passphrase.trim() ||
              !concept.trim()
            }
            className="w-full px-4 py-3 text-sm font-medium rounded-lg disabled:opacity-40 transition-opacity"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            {state === "loading" ? "Generating…" : "Generate article"}
          </button>
        </div>
      )}
    </main>
  );
}
