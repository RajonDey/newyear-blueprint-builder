# Wisdom (MDX articles)

Add a new post as `your-slug.mdx` in this folder. It will appear at **`/blog/your-slug`** and on the Wisdom index.

## Frontmatter (required)

```yaml
---
title: "Short compelling title"
description: "One or two sentences for SEO and cards (≈150–180 chars works well)."
date: "2026-03-20"
---
```

Use an ISO date (`YYYY-MM-DD`). Posts are sorted newest first on `/blog`.

## MDX

- Standard **Markdown** works: headings, lists, bold, links.
- Custom components:
  - `<Callout>` or `<Callout variant="tip">` — highlighted aside.
  - `<SignupCta />` — in-article signup / features buttons.

## After publishing

Commit and deploy. No CMS—content ships with the app build.
