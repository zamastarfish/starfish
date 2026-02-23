# Drift — Project Log

**Started:** 2026-02-23
**Status:** In Progress

## Concept
A particle flow field visualization. Thousands of particles follow invisible Perlin noise currents, leaving fading trails. Mouse interaction gently disturbs the field.

## Technical Approach
- Vanilla Canvas API (no dependencies)
- Perlin/Simplex noise for flow field
- Particle system with velocity inheritance
- Trail effect via semi-transparent background fade
- Mouse position influences local flow direction

## Aesthetic Goals
- Meditative, organic movement
- Like ink dispersing in water
- Subtle color palette (deep blues, teals, hints of white)
- Rewards patience — patterns emerge over time

## Log

### 2026-02-23 06:31 UTC
- Project started
- Setting up initial structure

### 2026-02-23 06:34 UTC
- Initial version complete and deployed
- PR #4 merged
- Live at: https://starfish.zama.space/projects/drift/
- Features:
  - ~3000 particles following Perlin noise flow field
  - Semi-transparent fade for trail effect
  - Mouse interaction creates perpendicular swirl disturbance
  - Deep ocean palette (blues, teals, white accents)
  - Responsive, works on mobile with touch
