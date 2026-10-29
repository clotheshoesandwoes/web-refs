# Rauno Freiberg

<!-- gallery:start -->
<p><a href="../../README.md#writing-and-personal-sites">All sites</a> &nbsp;&nbsp; <a href="../craig-mod/teardown.md">&larr; Craig Mod</a> &nbsp;&nbsp; <a href="../maggie-appleton/teardown.md">Maggie Appleton &rarr;</a> &nbsp;&nbsp; <a href="https://rauno.me">Open the live site</a></p>
<p><img src="motion.webp" width="100%" alt="Rauno Freiberg, first seconds with the cursor moving"></p>
<!-- gallery:end -->

Looked at on 2026-10-28. https://rauno.me

**The idea:** the portfolio is one interaction: scrolling moves a sideways reel of big-type slides.

![tick ruler, the intro slide with staggered lines over a yellow circle, crosshair at the centre](01-hero.jpg)
![Devouring Details slide with a giant D and an orange circle, the Craft slide starting](02-scroll.jpg)
![Craft slide with the word cropped at the card edge, and History of Software Design with a pixel hand](03-scroll.jpg)
![the pixel hand slide, the Projects slide, and Field Notes at the edge](04-scroll.jpg)
![phone: tick ruler and the intro slide with empty grey above and below](phone.jpg)

## What you see

A grey page with a row of white cards that slides sideways as you scroll. A ruler of thin ticks sits at top centre, one per card, and the current one widens into a box. A thin crosshair marks the centre of the screen. The first card sets "Rauno Freiberg is an Estonian interaction designer working with Vercel and Devouring Details" in six lines, every other line indented, over a flat yellow circle. Later cards hold one word set so large it crops at the edge ("DD", "Craft", "Projects") or a blue pixel hand cursor, each with a small grey sentence-case label above.

## Stack

| Layer | What |
|---|---|
| Framework | Next.js (pages router, `_next/static`) on Vercel |
| Fonts | One self-hosted file, `/dd.woff2` (51 KB), registered as the family "X" |
| Weight | 1,027 KB over 32 requests, 957 KB of it JS |
| Reduced motion | No `prefers-reduced-motion` rule |

## Steal

- Type as the picture: one word per card, big enough to crop at the edge.
- Hand-set line breaks with alternating indents, so a plain sentence reads as a title page.
- A tick ruler as the only navigation, one tick per item.
- Labels in small grey sentence case, not caps.

## Don't steal

- The flat colour circles. Nothing on the page says what they stand for, so they are decoration.
- Scroll turned sideways with no reduced-motion fallback.
- About 957 KB of JS for a page of words.
- On the phone the reel shows one small card in a mostly empty screen.
