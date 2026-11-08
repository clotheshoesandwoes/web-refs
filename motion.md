# Motion kit

Free tools for UI motion. The house rule still holds: motion only where it comes from the subject, at most one moment per page.

| Tool | What it does | Use it for |
|---|---|---|
| [Motion](https://motion.dev) (formerly Framer Motion, open source) | Springs, gestures, drag, layout animation (a list reflows smoothly when items move), shared-element transitions | React UI where something physically moves: reorder, drag, a card that becomes its page |
| [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) (built into browsers) | Animates between two page states, e.g. a card growing into its open page | Page-to-page continuity without a library; iPhone Safari 18+ |
| [Vaul](https://github.com/emilkowalski/vaul) | Phone-style bottom sheets with drag to dismiss | Mobile menus, detail panels |
| [Sonner](https://github.com/emilkowalski/sonner) | Toasts | Confirmations that need to say one thing and leave |

Pick the smallest one that does the job; View Transitions first when no React is involved.

Source: Sean's Grid chat, Nov 8, 2026.
