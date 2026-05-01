import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function checkPassphrase(given: string): boolean {
  const expected = process.env.ADMIN_PASSPHRASE;
  if (!expected || !given) return false;
  return given === expected;
}

// POST: generate article markdown
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { passphrase, concept, notes } = body;

  if (!checkPassphrase(passphrase)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!concept?.trim()) {
    return NextResponse.json({ error: "Concept name required" }, { status: 400 });
  }

  const stylePromptPath = path.join(process.cwd(), "content/style-prompt.md");
  const stylePrompt = fs.existsSync(stylePromptPath)
    ? fs.readFileSync(stylePromptPath, "utf8")
    : "Write clear, engaging articles about complex concepts for an engineer audience.";

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const today = new Date().toISOString().split("T")[0];
  const userMessage = [
    `Write an article about: **${concept}**`,
    notes?.trim() ? `\nAdditional context or angles to cover:\n${notes}` : "",
    `\nReturn ONLY the complete markdown file, starting with this exact YAML frontmatter:`,
    `---`,
    `title: ${concept}`,
    `category: <choose one: Computer Science, Mathematics, Philosophy, Economics & Risk, Physics, Other>`,
    `tags: [tag1, tag2, tag3]`,
    `created: ${today}`,
    `---`,
    ``,
    `Then the article body. No text before the frontmatter opening ---.`,
  ]
    .filter(Boolean)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: stylePrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const markdown =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";
  const slug = slugify(concept);

  return NextResponse.json({ markdown, slug });
}

// PUT: commit markdown to GitHub
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { passphrase, slug, markdown } = body;

  if (!checkPassphrase(passphrase)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return NextResponse.json(
      { error: "GitHub not configured (set GITHUB_TOKEN and GITHUB_REPO)" },
      { status: 500 }
    );
  }

  const filePath = `content/concepts/${slug}.md`;
  const content = Buffer.from(markdown).toString("base64");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  // Check if file exists to get its SHA (required for updates)
  let sha: string | undefined;
  const checkRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    { headers }
  );
  if (checkRes.ok) {
    const existing = await checkRes.json();
    sha = existing.sha;
  }

  const commitBody: Record<string, unknown> = {
    message: `Add concept: ${slug}`,
    content,
    branch: "main",
  };
  if (sha) commitBody.sha = sha;

  const commitRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    { method: "PUT", headers, body: JSON.stringify(commitBody) }
  );

  if (!commitRes.ok) {
    const err = await commitRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: err.message || "GitHub commit failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
