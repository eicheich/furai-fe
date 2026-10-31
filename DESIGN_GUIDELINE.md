# Furai Design Guideline & System (`v1.0`)

> **North Star Aesthetic: "Shibuya Editorial Pop" (`MacBook Air - 2` × `dōzo` × `STAZ`)**
> Furai's visual identity blends **Japanese independent magazine layout** (*dōzo*), **tactile stationery & graph-paper showcase frames** (*STAZ*), and a **bold cobalt-framed stage** (*MacBook Air - 2*). Every screen must feel art-directed, playful, tactile, and unmistakably human—never like a generic SaaS template or "AI slop".

---

## 1. Anti-"AI Slop" Guardrails (Golden Rules)

Before designing or coding any new component, modal, or page in Furai, verify it against this strict checklist:

| Forbidden ("AI Slop") | Required ("Furai Editorial Pop") |
| :--- | :--- |
| Emoji spam in headings, buttons, or cards (`🚨`, `🔥`, `🥔`, `🦐`) | Custom **inline SVG line-art** (`stroke="#161616" stroke-width="2"`), **bold Kanji glyphs** (`猫背`, `許可`), or **typographic badges** |
| Heavy offset brutalist drop-shadows (`4px 4px 0 #000`) on every single box | Crisp, **flat `2px` to `2.5px solid #161616` outlines**. Use subtle shadow (`0 6px 0 rgba(0,0,0,0.18)`) *only* on tilted floating CTA pills (`.pill-coral`) |
| Cluttered hero with sliders, multi-button toolbars, and fake chat bubbles | **Single-focus composition**: 1 headline, 1 concise paragraph, 1 primary CTA pill, and 1 art-directed visual stage |
| Exposing raw SRS requirement IDs (`FR-01`, `NFR-03`) as visible UI badges | Translate requirements into **human editorial copy** paired with subtle Japanese tags (`（フライとは）`, `STEP 01`, `いちおし`) |
| Generic SaaS dark mode / neon purple-blue gradients | **Solid editorial color-blocking**: Deep Cobalt (`#303ca3`), Warm Paper (`#f1f0eb`), Sky Blue (`#9bd7ea`), Shrimp (`#f28a52`), Yellow (`#ffe04a`), Mint (`#5cc9a0`) |
| Arbitrary absolute positioning that breaks on resize | **Locked aspect-ratio containers** (`aspect-ratio: 1108 / 645`, `container-type: inline-size`) with percentage coordinates and `cqw` typography |

---

## 2. Color System & Section Rhythm

Defined in `src/index.css`:

```css
:root {
  /* Core Surfaces & Ink */
  --cobalt: #303ca3;   /* Hero & Footer stage frame (from MacBook Air - 2) */
  --paper:  #f1f0eb;   /* Primary warm off-white page canvas (from STAZ) */
  --cream:  #f6e7c8;   /* Soft warm surface for comparison tiles */
  --ink:    #161616;   /* Primary text & all 2px–2.5px structural borders */
  --muted:  #5b5a55;   /* Secondary body copy & subcaptions */
  --line:   #dcdad2;   /* 28px graph-paper grid lines & subtle dividers */

  /* Pop Accents */
  --shrimp: #f28a52;   /* Brand primary accent, period dot, shrimp posture state */
  --coral:  #f08a6e;   /* Tilted floating CTA pills (.pill-coral) */
  --yellow: #ffe04a;   /* Starbursts, step badges, highlighted pills */
  --mint:   #5cc9a0;   /* Aligned posture state, "ZERO BYTES" highlight, status dots */
  --sky:    #9bd7ea;   /* Full-bleed editorial feature band (.band--sky) */
}
```

### Vertical Color-Blocking Rhythm
1. **Hero Wrap (`--cobalt #303ca3`)**: Houses the top pill navbar and the rounded white `.stage` canvas (`#ffffff`).
2. **STAZ Showcase Section (`--paper #f1f0eb`)**: Houses `.card-staz` with a `28px × 28px` graph-paper grid and inner white `.frame`.
3. **dōzo Editorial Band (`#ffffff`)**: Full-width band with `2px solid #161616` top/bottom borders and 4-column `.steps` grid divided by `1px solid var(--line)`.
4. **dōzo Feature Pick-Up Band (`--sky #9bd7ea`)**: Full-width sky-blue band with `2px solid #161616` borders and 4-column `.picks` cards.
5. **Proof / Detail Section (`--paper #f1f0eb`)**: Secondary `.card-staz` showcase (e.g., Privacy & DevTools Network log).
6. **Footer (`--cobalt #303ca3`)**: Minimal links + giant outlined `Furai` wordmark bleeding off the bottom edge.

---

## 3. Typography & Bilingual (EN + JP) Architecture

Loaded in `index.html` and mapped in `src/index.css`:

- **`--f-display` (`'Dela Gothic One'`, 400)**: Heavy Japanese display face for uppercase section headers (`WHAT IS FURAI`, `PRIVACY`), editorial titles (`How it works`, `Pick up`), and bold Kanji tiles (`許可`, `調整`, `集中`, `記録`, `猫背`).
- **`--f-round` (`'M PLUS Rounded 1c'`, 500/700/800)**: Friendly rounded Japanese-Latin face for the `Furai` wordmark, `posture reveal.` hero title, vertical tategaki (`猫背、バレてるよ。`), and tilted `.pill-coral` stickers.
- **`--f-body` (`'Zen Kaku Gothic New'`, 400/500/700/900)**: Clean Japanese gothic body font with generous `line-height: 1.65–1.9`.
- **`--f-mono` (`'DM Mono'`, 400/500)**: Technical metadata, uppercase eyebrows (`A STUDY BUDDY WITH A SPINE`), vertical step numbers (`STEP 01`), romaji captions, and DevTools logs.

---

## 4. Layout Geometry & Signature Components

- **Hero Stage (`.stage`)**: `aspect-ratio: 1108 / 645`, `container-type: inline-size`, `border-radius: clamp(18px, 3vw, 34px)`, `box-shadow: inset 0 0 48px 8px rgba(0, 0, 0, 0.2)`.
  - `.stage__desk`: `left: 3.88%; top: 0; width: 92.33%`
  - `.stage__shrimp` & `.stage__pose`: `left: 47.92%; top: 45.89%; width: 43.68%`
- **STAZ Showcase Card (`.card-staz`)**: `2.5px solid var(--ink)`, `border-radius: 34px`, `28px` graph-paper background, spinning `RoundSticker`, inner white `.frame`, rotated comparison tiles (`-3deg`, `2deg`) with horizontal pointer lines (`.tile__label::after`), and `-8deg` `.pill-coral` sticker.
- **dōzo Editorial Grids (`.steps` & `.picks`)**: 4-column grids with vertical rotated `STEP 01` labels, circular Kanji tiles with `-10deg` badges, and sky-blue Pick Up cards with top-left Japanese category ribbons (`いちおし`, `定番`, `人気`, `安心`).

