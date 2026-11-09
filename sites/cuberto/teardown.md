# Cuberto

<!-- gallery:start -->
<p><a href="../../README.md#studios-and-motion-craft">All sites</a> &nbsp;&nbsp; <a href="../lynn-fisher/teardown.md">&larr; Lynn Fisher</a> &nbsp;&nbsp; <a href="../lando-norris/teardown.md">Lando Norris &rarr;</a> &nbsp;&nbsp; <a href="https://cuberto.com">Open the live site</a></p>
<p><img src="motion.webp" width="100%" alt="Cuberto, first seconds with the cursor moving"></p>
<!-- gallery:end -->

Looked at on 2026-11-08. https://cuberto.com

**The idea:** a product agency site where the polish is in the cursor and the scroll.

![white page: "Digital design & development agency" centered over a dark rounded video card](01-hero.jpg)
![services as stacked dark cards with soft gradient shapes, numbered 01-05](03-scroll.jpg)
![Selected work on black: device mockups in rounded tiles](05-scroll.jpg)
![phone: title and the first project tile](phone.jpg)

## What you see
Clean white top, a centered two-line title and a dark rounded card with product footage. Services come as stacked dark cards that slide over each other as you scroll, each with a soft gradient shape. The work section flips to black with device mockups. The cursor is the signature: it grows, sticks to buttons and shows labels over links. Cuberto open-sourced it as `mouse-follower`.

## Stack
| Layer | What |
|---|---|
| Framework | Astro, Lenis smooth scroll |
| Fonts | Suisse Intl |
| Weight | 6.0 MB, 44 requests |
| Reduced motion | Has a `prefers-reduced-motion` rule |
| Hosting | Vercel |

## Steal
- Stacked cards that pin and slide over each other while scrolling: one clear motion that organizes a list.
- A cursor that does useful work (labels, magnet on buttons), not just a trailing dot.
- Their open-source `mouse-follower` plus Lenis are the usual stack for this feel.

## Don't steal
- Smooth-scroll hijacking on a text site: it fights the reader's own scroll.
- Gradient blobs as decoration. Here they mark sections; copied without that, they're slop.
