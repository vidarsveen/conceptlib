import Link from "next/link";
import { getAllConcepts } from "@/lib/concepts";

const CATEGORIES = [
  "Computer Science",
  "Mathematics",
  "Philosophy",
  "Economics & Risk",
  "Physics",
];

export default function Home() {
  const concepts = getAllConcepts();

  const byCategory = CATEGORIES.map((cat) => ({
    name: cat,
    concepts: concepts.filter((c) => c.category === cat),
  })).filter((g) => g.concepts.length > 0);

  const otherConcepts = concepts.filter((c) => !CATEGORIES.includes(c.category));
  if (otherConcepts.length > 0) {
    byCategory.push({ name: "Other", concepts: otherConcepts });
  }

  return (
    <main className="flex-1 px-4 py-10 max-w-xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Concept Library</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {concepts.length} concept{concepts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Alphabetical list */}
      <section className="mb-12">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--muted)" }}
        >
          A – Z
        </h2>
        {concepts.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No concepts yet.{" "}
            <Link href="/admin" className="underline">
              Add one →
            </Link>
          </p>
        ) : (
          <ul>
            {concepts.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/concept/${c.slug}`}
                  className="flex items-baseline justify-between py-2.5 border-b hover:opacity-60 transition-opacity"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="font-medium">{c.title}</span>
                  <span
                    className="text-xs ml-4 shrink-0"
                    style={{ color: "var(--muted)" }}
                  >
                    {c.category}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* By category */}
      {byCategory.map((group) => (
        <section key={group.name} className="mb-8">
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--muted)" }}
          >
            {group.name}
          </h2>
          <ul className="space-y-1">
            {group.concepts.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/concept/${c.slug}`}
                  className="block py-1 text-sm hover:opacity-60 transition-opacity"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer
        className="mt-14 pt-6 border-t text-xs"
        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
      >
        <Link href="/admin" className="hover:opacity-60 transition-opacity">
          + Add concept
        </Link>
      </footer>
    </main>
  );
}
