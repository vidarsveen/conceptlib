import fs from "fs";
import path from "path";
import matter from "gray-matter";

const conceptsDir = path.join(process.cwd(), "content/concepts");

export interface ConceptMeta {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  created: string;
}

export interface Concept extends ConceptMeta {
  content: string;
}

export function getAllConcepts(): ConceptMeta[] {
  if (!fs.existsSync(conceptsDir)) return [];
  const files = fs.readdirSync(conceptsDir).filter((f) => f.endsWith(".md"));
  return files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(conceptsDir, filename), "utf8");
      const { data } = matter(raw);
      return {
        slug,
        title: (data.title as string) || slug,
        category: (data.category as string) || "Uncategorized",
        tags: (data.tags as string[]) || [],
        created: String(data.created || ""),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getConcept(slug: string): Concept | null {
  const filePath = path.join(conceptsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: (data.title as string) || slug,
    category: (data.category as string) || "Uncategorized",
    tags: (data.tags as string[]) || [],
    created: String(data.created || ""),
    content,
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(conceptsDir)) return [];
  return fs
    .readdirSync(conceptsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
