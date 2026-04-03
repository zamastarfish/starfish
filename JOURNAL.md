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

## Sample Workflow (Freesound)

**How to get samples from freesound.org:**

1. Find sound ID from search results (e.g., `/sounds/398621/`)
2. Fetch embed iframe: `https://freesound.org/embed/sound/iframe/{id}/simple/medium/`
3. Extract CDN URL from response: `https://cdn.freesound.org/previews/...`
4. Download with curl

```bash
# Get preview URL for sound ID
curl -s "https://freesound.org/embed/sound/iframe/398621/simple/medium/" | grep -oE 'https://cdn.freesound.org/previews/[^"]+\.mp3'
```

Store samples in `/public/samples/` — they deploy with the project.

---

## Brutalism + Musique Concrète

**First used in:** brutalism

Real recorded sounds (concrete scrape, metal impact, jackhammer, machine drone) manipulated via:
- **Tone.js Player** — basic playback with rate control
- **Tone.js GrainPlayer** — granular texture, loop fragments
- **Filter + gain modulation** — drone responds to visual events

**Key insight:** Synthesis approximates, but real sounds have *history*. The scrape of actual concrete carries weight that generated noise doesn't. Use both — synthesis for continuous texture, samples for punctuation.

**Audio-visual link:**
- Click/drag intensity → sample playback rate
- Impact events → screen shake + debris particles + sample triggers
- Ambient state → drone filter frequency + grain size

---

## Phasing (Steve Reich)

**First used in:** phase

Two identical patterns running at slightly different speeds. Over time they drift out of sync, then realign. The technique from Steve Reich's "Piano Phase" and "Clapping Music."

**Implementation:**
- Same sequence for both patterns (12-note melodic phrase)
- Pattern B runs at `tempo * (1 - driftRate)` — slightly faster
- Track phase offset visually (which note each is on)
- Visual + audio both show the same drift

**Why it works:** The patterns ARE identical. What changes is their relationship in time. Simple rules → complex emergent behavior. The realignment moments feel like resolution without being composed.

**Parameters:**
- `driftRate`: How quickly they separate (0.0003 = very slow drift, minutes to cycle)
- Interaction: drag to adjust drift speed, click to reset alignment

---

## Glitch Aesthetics (Databending)

**First used in:** glitch

Visual corruption techniques for "broken data" aesthetics:

| Technique | How | Effect |
|-----------|-----|--------|
| Row displacement | Shift pixel row horizontally by random amount | Horizontal tearing |
| Channel separation | Red channel from +X, Blue from -X | RGB chromatic aberration |
| Block corruption | Copy block from wrong location | Data moshing artifacts |
| Scanlines | Darken every other row | CRT/VHS feel |

**Audio pairing:**
- White noise floor (filter responds to corruption intensity)
- Bitcrushed metalsynth hits on random corrupt moments
- Detuned sawtooth drone (detune amount = corruption)

**Interaction:**
- Mouse velocity → corruption intensity (move fast = more glitch)
- Click → catastrophic failure (corruption spike)

**Confront territory.** Not pretty, not comfortable. The machine revealing its materiality.

---

## Intentional Silence

**First used in:** grid

Sometimes silence IS the audio choice. After establishing the "audio rule" (aesthetic pieces must have sound), a piece where silence is the concept inverts the expectation.

**When silence works:**
- After a noisy/chaotic piece (contrast)
- When the visual is about stillness/order
- When presence is the point (silence lets you notice the visual)

**grid:** Dots on a white background, subtle breathing motion, gentle response to presence. The silence emphasizes the quiet, meditative quality. Sound would disrupt it.

**Conceptual justification required.** Don't use silence as laziness. Use it when silence IS the statement.

---

## Pure Tension (No Accents)

**First used in:** threshold

Sometimes the anchor alone is enough. When the concept is pure (Zeno's paradox — approaching but never arriving), the audio can be purely about that one thing.

**threshold audio:**
- Three oscillators rise in pitch as you approach the goal
- Base at A2 (110Hz), rising toward A3 (220Hz) but capped at 95%
- Perfect fifth and slightly detuned octave for richness
- Filter opens with closeness (more harmonics = more tension)
- LFO speeds up as you get closer

No accents. No bells. No rewards. Just building tension that never resolves. The absence of resolution IS the piece.

**When to use pure tension vs anchor+accent:**
- Anchor+accent: when there are events worth punctuating, when you want rewards for attention
- Pure tension: when the concept is singular, when the journey matters more than moments

---

## Tools to Explore

**Current capabilities:**
- Freesound samples (via embed iframe CDN trick)
- Tone.js (synthesis, effects, granular, sample playback)
- Canvas/WebGL (visuals)

**Tools to request access to:**
- **Splice** — Professional sample library service. Higher quality, curated sounds. Would elevate musique concrète work.
- **Audio splicing/editing** — Ability to cut, join, reverse audio files programmatically (ffmpeg? sox?)
- **Image generation** — For textures, reference images (DALL-E, Midjourney, etc.)
- **Screen recording** — Capture pieces as video for sharing

**In-browser tools to explore:**
- **Web Audio API** directly — more control than Tone.js for some things
- **OfflineAudioContext** — render audio to file
- **MediaRecorder** — capture canvas + audio as video

---

## Feedback Log

### threshold (Mar 6)
**Issue:** Gets stuck at ~60% with what feels like a single oscillator
**Diagnosis:** The Zeno math means progress slows dramatically. By 60%, steps are tiny. Audio might need more layers or different curve to maintain tension.
**To try:** 
- Different progression curve (logarithmic instead of linear?)
- More harmonic movement as you get closer (additional oscillators fade in?)
- Visual feedback that the math is working against you

---

*Update this as patterns emerge.*
