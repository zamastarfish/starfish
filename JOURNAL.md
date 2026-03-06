# JOURNAL.md — Techniques & Learnings

A living document of what works. Patterns to reuse. Indexed by piece.

---

## Audio-Visual Linkage Patterns

### The Anchor + Accent Pattern
**First used in:** mono-no-aware, bauhaus-beat

The audio has two layers:
1. **Anchor** — A continuous element that grounds the piece. Always present, shifts subtly.
2. **Accents** — Sparse events that reward attention. Not constant, not predictable.

In **mono-no-aware**:
- Anchor: Wind drone (pink noise → lowpass filter). Filter frequency responds to wind intensity (more movement = brighter sound)
- Accents: Pentatonic bells on petal landing. Sparse (12% chance, 800ms cooldown). Quiet, reverbed.
- Depth layer: Quiet C/G drone underneath (barely audible, adds warmth)

In **bauhaus-beat**:
- Anchor: Kick drum on grid, steady pulse
- Accents: Hi-hat, snare, bass float on independent loops (Eno-style incommensurable intervals)

**Why it works:** The anchor creates presence (you're *in* the space). The accents create moments (rewards for staying). Neither alone is enough.

---

### Parameter Mapping

How visual state maps to audio:

| Visual | Audio | Example |
|--------|-------|---------|
| Wind intensity | Filter frequency | mono-no-aware: more wind = brighter noise |
| Particle density | Volume/activity | More particles = fuller sound |
| Season/time | Master volume | mono-no-aware: fades as petals thin |
| User movement | Modulation | Moving mouse = stirring the sound |
| Event (collision, landing) | Triggered note | Petal lands = bell chance |

**Principle:** The mapping should feel inevitable. If you could swap a different parameter and nothing feels wrong, the link is arbitrary.

---

### Restraint in Accents

From mono-no-aware: Not every petal triggers a bell. 

If every event made sound, it would be:
- Overwhelming (too many bells)
- Predictable (I know what's coming)
- Annoying (constant pings)

Instead: 12% chance + cooldown. The bells surprise you. They're gifts, not obligations.

**Rule:** Accents should feel like discoveries, not mechanics.

---

## Pieces & Their Techniques

| Piece | Technique | Notes |
|-------|-----------|-------|
| mono-no-aware | anchor+accent, wind-to-filter mapping | First full audio-visual piece with this pattern |
| bauhaus-beat | Eno loops, prime intervals | Independent rhythmic layers that never sync |
| resonance | Audio-visual frequency matching | Drone detunes with visual moiré shift |

---

## To Explore

- **Threshold:** Rising tension that never resolves. Pitch/harmony approaching but never arriving (Zeno for sound)
- **Brutalism + musique concrète:** Raw synthesis as honest material. Granular textures, industrial noise, harsh cuts
- **Silence as sound:** What if the absence is the point? Pieces where sound fades and the silence is the art

---

*Update this as patterns emerge.*
