# Ingri design tokens

The interface is a light aqua canvas with an ink (`#0d0d0d`) and paper base, soft pastel accents, and large rounded glass cards. Dark mode keeps the same pastels for chips and charts and moves surfaces to ink.

Tokens live in `front/src/styles/globals.css` as CSS variables and are mapped into Tailwind v4 with `@theme inline`. Components use token utilities (`bg-lilac`, `text-title`, `rounded-xl`, `shadow-soft`) instead of raw hex values or one-off sizes.

## Color

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ink` | `#0d0d0d` | `#0d0d0d` | Text on pastel chips, sidebar in light mode |
| `--paper` | `#ffffff` | `#ffffff` | Highlights on dark surfaces |
| `--background` / `--aqua` | `#ddf4f7` | `#0d0d0d` | Page canvas |
| `--foreground` | `#0d0d0d` | `#f6f7f8` | Body text |
| `--card` | `#ffffff` | `#171717` | Glass cards |
| `--primary` | `#0d0d0d` | `#f4f4f5` | Main buttons |
| `--secondary` / `--lilac` | `#e3c8f5` | lilac stays `#e3c8f5` | Active nav, chips |
| `--lilac-deep` | `#d9b8f0` | same | Charts, progress |
| `--accent` / `--mint` | `#c8f0d0` | mint stays bright | Success, calendar |
| `--mint-deep` | `#bdebc8` | same | Illustration detail |
| `--peach` | `#fbe6b5` | same | Invite, warnings, crown |
| `--danger` | `#b4333c` | same | Destructive actions |
| `--muted` | `#eef7f8` | `#1c1c1c` | Quiet fills |
| `--sidebar` | `#0d0d0d` | `#111111` | Desktop sidebar and mobile nav |

## Typography

Poppins, loaded in the root layout.

| Token | Size |
| --- | --- |
| `--text-display` | `clamp(2.4rem, 4vw, 3.5rem)` |
| `--text-title` | `clamp(1.7rem, 2.6vw, 2.4rem)` |
| Body | `1rem` / Tailwind `text-sm` for secondary copy |

Weights in use: 400, 500, 600, 700, 800.

## Spacing, radius, shadow

Spacing follows Tailwind’s 4px scale (`--spacing: 0.25rem`). Section rhythm uses `--space-section` (`4.5rem`) as `py-section`.

| Token | Value |
| --- | --- |
| `--radius-sm` | `0.875rem` |
| `--radius-md` | `1.25rem` |
| `--radius-lg` | `1.75rem` |
| `--radius-xl` | `2rem` |
| `--shadow-soft` | lifted card |
| `--shadow-glass` | inner highlight plus soft drop |
| `--container-page` | `76rem` (`max-w-page`) |

## Motion and layers

| Token | Value |
| --- | --- |
| `--ease-fluid` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--z-header` | `40` |
| `--z-nav` | `45` |
| `--z-overlay` | `60` |
| `--z-cursor` | `80` |

`.glass` and `.liquid-card` are the shared surface treatments (blur, sheen on hover). `.blob` and `.orbit` are decorative. Motion is disabled when the user prefers reduced motion.

## Breakpoints

| Token | Width | Layout |
| --- | --- | --- |
| default | under `48rem` | Bottom navigation |
| `md` | `48rem` | Two-column cards |
| `lg` | `64rem` | Sidebar, bottom nav hidden |

## Primitives

`Container`, `Section`, `SectionTitle`, `StatTile`, `IconBox`, `PersonAvatar`, shadcn `Button`, `Card`, `Badge`, `Input`, `Dialog`, plus `MotionReveal`, `LiquidCursor`, and the SVG scenes in `src/ui/illustrations/Decor.tsx`.
