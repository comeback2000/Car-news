# Premium Content Framework

This workflow treats the seed keyword as a research input, not as article filler. Article bodies are written by the Codex Desktop agent after live research, source review, and editorial judgment. The publisher must not fall back to repeated templates or API-written filler.

## Research

- Search Google News for the seed keyword plus India-specific context.
- Collect several current headlines and source names before writing.
- Identify the real reader intent behind the keyword: launch timing, price, ownership cost, range, charging, service support, software features, resale value, or upgrade timing.
- Convert the seed keyword into natural long-tail phrases that match how readers think.

## Headline

- Do not prefix the article title with the seed keyword.
- Write a click-worthy headline that sounds like a human editor wrote it.
- Prefer buyer tension: what to watch, what changed, what buyers should check, what could shift the shortlist.

## Article Body

- Start with a clear H1 title and a useful introduction.
- Let section headings emerge from the actual story. Do not reuse the same headings across every post.
- Explain what changed in the latest news cycle.
- Add buyer-focused context, not just a summary.
- Include market comparison, ownership impact, practical checks, and what to watch next.
- Use the seed keyword sparingly and naturally.
- Use long-tail phrases only where they help the reader.
- Do not copy source articles. Use them to understand the trend and build original analysis.
- Never publish process language such as "seed keyword", "template", "prompt", "AI-generated", or "SEO process" in article copy.

## Thumbnail

- Use a real official manufacturer, brand, or company image whenever possible. If an official source is blocked or unavailable, use a clearly attributable public-domain/Commons source and record that choice.
- Match the source image to the exact article angle: Tata article means Tata vehicle, Hyundai article means Hyundai vehicle, Ola article means Ola vehicle, Apple article means Apple product imagery.
- Do not reuse the same base vehicle, product, source URL, crop, or near-identical visual style across different new posts, even if the final file hash is different.
- Add a strong editorial overlay: badge, bold headline, dark contrast, and a CTR-focused strapline.
- Before publishing, create a contact sheet of the new thumbnails and review it visually. Reject the batch if two cards look like the same photo/design with different text.
- Track both exact thumbnail hashes and human-readable source identities such as brand, model, source URL, and crop notes.

## Publishing

- Preserve the existing duplicate checks, Facebook posting, GitHub push, sitemap, category pages, tag pages, and internal linking.
- Add new improvements by extending the workflow.
- Do not remove working features unless explicitly requested.
- Use the Codex Desktop automation for scheduled article creation and this repo's PowerShell helper for build, GitHub publishing, and Facebook retry/finalization.
- If Codex cannot complete enough research or produce a strong article, stop the run instead of publishing filler.
