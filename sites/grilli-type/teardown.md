# Grilli Type

<!-- gallery:start -->
<p><a href="../../README.md#type-foundries-and-editorial">All sites</a> &nbsp;&nbsp; <a href="../klim/teardown.md">&larr; Klim Type Foundry</a> &nbsp;&nbsp; <a href="../dinamo/teardown.md">Dinamo &rarr;</a> &nbsp;&nbsp; <a href="https://www.grillitype.com">Open the live site</a></p>
<p><img src="motion.webp" width="100%" alt="Grilli Type, first seconds with the cursor moving"></p>
<!-- gallery:end -->

Looked at on 2026-10-28. https://www.grillitype.com

**The idea:** a Swiss ruled index where every typeface name is set in its own face.

![GT Mechanik minisite banner drawn as a test card, then the first retail typeface names](01-hero.jpg)
![two ruled columns of typeface names, each set in itself, then the Grilli Kiosk photo](02-scroll.jpg)
![Grilli Kiosk photo of orange booklets, and GT In Use with the Museu Terra rebrand](03-scroll.jpg)
![GT Standard poster in red, black and white, and commission case studies for Decathlon and Figma Sans](04-scroll.jpg)
![GT Academy lesson covers and the Variable Fonts Guide](05-scroll.jpg)
![phone: the test-card banner and typeface names stacked one per row](phone.jpg)

## What you see

A white page with a black rule under the nav. Every section starts with a plain label in the left column ("Retail typefaces", "GT In Use", "Commission Case Studies") and its content to the right. The retail list is two columns of names, each set at about 45 px in its own typeface, with grey hairlines between rows. Below come large images: a booklet photo, client work, a red GT Standard poster, and the GT Academy covers with a short paragraph beside them. On the phone the names stack one per row and keep their size.

## Stack

| Layer | What |
|---|---|
| Framework | Angular 9.0.1, rendered on the server (`ng-transition="serverApp"`), Express behind nginx 1.11.3 and CloudFront |
| Grid | CSS grid, 14 columns, 20 px gaps. Section labels take the first two columns; content runs from column 3 |
| Fonts | GT Corporate for the interface, plus each listed family loaded to set its own name: GT Era, Mechanik, Canon, Standard, Flaire, Pantheon, America |
| Weight | 13,094 KB over 56 requests: 9,371 KB images, 1,579 KB JS, 1,394 KB fonts |
| Reduced motion | No `prefers-reduced-motion` rule |

## Steal

- Name each family in itself. The list of names is the specimen.
- A hanging label column: section names in the first two of 14 columns, everything else hangs off column 3.
- Hairlines under list rows instead of cards or boxes.
- Interface type at one small size and one weight, so the specimens carry all the contrast.

## Don't steal

- Nothing on the banned list. The mono caps on the Mechanik banner are specimen art for a mono typeface.
- The weight: 13 MB for a home page, mostly images.
