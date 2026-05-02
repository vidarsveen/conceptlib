# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

The entire site is a single self-contained file: `index.html`. There is no build step, no framework, no package manager, and no external dependencies. Open `index.html` directly in a browser to run the site.

All data, styles, and logic live in this one file:
- **CSS**: in a `<style>` block in `<head>`
- **Data**: `CATEGORIES` and `CONCEPTS` arrays in an inline `<script>` block
- **Routing**: hash-based (`#/concept/<id>`), handled by `getRoute()` / `go()` / `render()`
- **Rendering**: `renderHome()` and `renderConcept(id)` build HTML strings injected into `#app`

## Adding a Concept

Add an object to the `CONCEPTS` array (before `]; // end CONCEPTS`) with this shape:

```js
{
  id: 'kebab-case-id',
  title: 'Display Title',
  category: 'risk' | 'logic' | 'computation' | 'philosophy',
  source: 'Author (Year)',
  tags: ['tag1', 'tag2', ...],
  body: `<p>...</p><h2>...</h2><p>...</p>`
}
```

The `body` field is raw HTML rendered directly into `.article-body`. Use only `<p>`, `<h2>`, `<strong>`, and `<em>` tags — no `<h1>`, no `<ul>` unless truly necessary.

## Content Style

Concept bodies follow a strict style:

- **800–1200 words**, 2–3 `<h2>` sections
- Open with a concrete scenario or surprising observation — no preamble, no definition first
- Introduce the precise concept once the reader is oriented
- Prose-first; no bullet lists
- Direct and confident voice — no hedging ("it's worth noting", "one might argue")
- Close with implications, limits, or connection to adjacent ideas

## Validating Changes

After editing `index.html`, verify the `CONCEPTS` array still parses:

```sh
node -e "
const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const m = src.match(/const CONCEPTS = (\[[\s\S]*?\]); \/\/ end CONCEPTS/);
const CONCEPTS = eval(m[1]);
console.log(CONCEPTS.length, 'concepts:', CONCEPTS.map(c => c.id).join(', '));
"
```
