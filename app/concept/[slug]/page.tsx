import Link from "next/link";
import { notFound } from "next/navigation";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { getAllSlugs, getConcept } from "@/lib/concepts";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ConceptPage({ params }: Props) {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) notFound();

  const processed = await remark().use(remarkHtml).process(concept.content);
  const html = processed.toString();

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

      <header className="mb-8">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--muted)" }}
        >
          {concept.category}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight leading-snug">
          {concept.title}
        </h1>
        {concept.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {concept.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--border)", color: "var(--muted)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer
        className="mt-14 pt-6 border-t text-xs"
        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
      >
        {concept.created && <span>Added {concept.created}</span>}
      </footer>
    </main>
  );
}
