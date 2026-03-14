# LandingPage

Page-local orchestrator and SVG motion visuals for the public landing page.

- `index.tsx` keeps the landing page section structure and copy.
- `LandingMotionVisuals.tsx` contains the animated SVG section visuals.
- Static textures that do not need React motion stay under `web/public/vectors/landing/`.

Keep landing-specific visuals here instead of rebuilding large HTML mockup panels inside the page file.
