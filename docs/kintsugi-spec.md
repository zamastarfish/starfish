# Kintsugi — Art Specification

## Concept

**Kintsugi** (金継ぎ, "golden joinery") is the Japanese art of repairing broken pottery with lacquer mixed with gold. Rather than disguising damage, it illuminates it — making the history of breakage part of the object's beauty.

This piece is about:
- **The impossibility of return** — you cannot un-break something
- **Transformation through damage** — the mended object is different, not lesser
- **Accumulation of history** — each break adds to the story
- **The weight of destruction** — breaking should feel consequential
- **Witnessed healing** — you cause the damage; the mending happens to you

It sits in the **Confront** category, but arrives at something like peace.

---

## The Experience Arc

### 1. Encounter
You arrive at a simple ceramic vessel — a bowl, seen in soft light. It's humble, beautiful, whole. A moment to appreciate it before anything happens.

No instructions. A subtle pulse suggesting it can be interacted with.

### 2. The Break
**Click and hold** to break. This is not a tap — you must commit. 

As you hold, tension builds. The vessel trembles slightly. The longer you hold, the more dramatically it will shatter.

### 3. The Shatter
**Fast, physical, irreversible.** Fragments fly outward with physics — spin, scatter. Then silence.

### 4. The Pause
**2-3 seconds of sitting with the damage.** The fragments are still. You see what you've done.

### 5. The Mending
Gold begins to flow along the crack lines, then fragments slowly drift back toward center. The gold connects them, filling the seams.

This takes **15-20 seconds** — slow enough to be meditative.

### 6. Return to Wholeness
The vessel is whole again, but changed. The gold scars remain. You can break it again. Each time adds more gold.

---

## Visual Design

### The Vessel
- **Form:** A simple bowl, seen from above (top-down view)
- **Material:** Matte ceramic, soft warm off-white
- **Background:** Dark, warm near-black (#1a1918)

### The Break
- **Fragmentation:** Organic, irregular shards via Voronoi with jitter
- **Physics:** Fragments rotate and scatter, affected by gravity

### The Gold
- **Luminous** — glowing slightly
- **Liquid during flow** — organic movement
- **Solid when set** — material presence
- **Warm** — gold is warm

### Color Palette
- Ceramic: `#e8e4df` (warm off-white) to `#c9c4bc` (shadow)
- Background: `#1a1918` (warm near-black)
- Gold: `#d4a847` base, `#ffd700` highlights, `#a67c00` shadows

---

## Interaction Design

| Action | Result |
|--------|--------|
| Hover | Subtle glow indicating interactivity |
| Click + hold (0.5s) | Tension — vessel trembles |
| Click + hold (1-2s) | Cracking sounds, fracture lines appear |
| Release at 1s | Moderate break (5-8 fragments) |
| Release at 2s+ | Dramatic shatter (12-20 fragments) |

No interaction during mending. You witness; you don't control.

---

## Technical Approach

- **2D Canvas** based
- **View:** Top-down into bowl
- **Fragmentation:** Voronoi-based with organic jitter
- **Physics:** Simple 2D physics for scatter
- **Gold flow:** Animated along fragment edges with glow
- **Reassembly:** Lerp fragments back to original positions

---

## Decisions Made

- 2D (not 3D)
- Dark background
- No text
- Sound optional (add if time permits)
