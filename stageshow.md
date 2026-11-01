# Stageshow: the highlights

[Stageshow](https://github.com/benjitaylor/skills/tree/main/stageshow) is Benji Taylor's skill and React kit for fake product screens: hero demos, feature cards, bento tiles, a cursor doing one thing. MIT. These are the rules from it worth carrying into any page with a product shot, written short. The source says them better and with examples; read `SKILL.md`, then `references/craft.md`, `framing.md` and `motion.md`.

```sh
npx skills add benjitaylor/skills --skill stageshow
```

## The one idea

It reads as a real product, cut down to what the viewer needs, framed on purpose, and every motion has a cause.

Five ways it fails:

- **Too much.** Real text in every row. The more detail, the more it looks generated.
- **Wireframe.** Two gray blobs and a button.
- **Boxed.** A whole window shrunk into a card with even margins: a screenshot pasted in.
- **Flat.** Every object the same weight in the same bordered card.
- **Bland.** A gray window with a cursor, whatever the brief asked for.

## Words

- Count the real strings: usually 3 to 7 (the title, the thing acted on, what is typed, the result). Everything else is a placeholder bar.
- Bars go at the edges. A gray bar where the eye lands reads unfinished.
- One number gets to be big; the rest are lines.
- Say it once. The feature's signal in one place, not in the header, the card and every row.
- No masthead or logo for a made-up product. A letter in a colored square is not a logo.
- Keep what makes the domain recognizable: album art in a music app, avatars in chat.

## Type and spacing

- One family. Mono only for code and aligned numbers, never for labels. Sentence case.
- UI text at real sizes (11 to 15px), then scale the whole stage. Never 7px type.
- Words keep 12px from any edge. Row padding 12px, 8px when dense.
- A title and its subtitle sit 4 to 6px apart; the air comes from the row padding.
- Nothing sits 1 to 3px from another edge. Line it up exactly or part it by 8px or more.
- A centered price centers its digits; the currency sign hangs outside.
- Nested shapes: outer radius equals inner radius plus the padding.

## Icons and color

- Icons come from one set at one size and one stroke. A hand-drawn glyph is the first tell of generated UI.
- At 14px and under, use filled icons; thin outlines go wiry.
- Emoji are content, never icons.
- AI gets no sparkle, wand or star, and no purple. Show what the AI does.
- One neutral family, five inks, one accent. Status colors only mean status.
- On dark, depth comes from a lighter surface, not a shadow.
- The hero is not outlined with a glowing ring to point at it.

## Framing

- One hero object, one or two smaller objects at most, each straddling the hero's edge about half outside.
- Crop 10 to 40% of the hero off the stage. Crop only filler, never the action or a real word.
- No plate behind the window, and no window floating with air on four sides.
- One gutter, the same on every edge. No dead corners.
- Start flat and frontal; a tilt has to beat the straight version.
- Design at the size it will be seen. A phone column gets its own layout, not a squeeze.

## Motion

- A loop is 10 to 16 seconds: three to five beats and a payoff that holds for 2 seconds.
- Open on a finished screen that works as a still. The poster frame tells the story alone.
- Every change moves: text rolls, a surface morphs, a list makes room. Nothing swaps in one frame.
- Data never rewinds in view. A reset has a visible cause (undo, close) or happens out of sight.
- UI feedback stays as fast as the real product; only the storytelling is slow.
- Two curves: travel `cubic-bezier(0.45, 0, 0.1, 1)`, arrival `cubic-bezier(0.25, 0.8, 0.25, 1)` over 0.8 to 1s. Stagger 40 to 80ms.
- Nothing pulses while holding a result.

## Where it parts from our house rules

Skip its `glass` theme, the `corner-chip` layout and the violet gradient field on its cover. Our slop check flags 64 spots across its 231 kit and example files, mostly in those and the background specimens. Use `light` or `dark`, `accent` or `mono`.
