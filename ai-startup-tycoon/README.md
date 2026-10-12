# AI Startup Tycoon — Pre-Alpha v0.1

A Turkish-language, offline-first business strategy game where you grow a small AI company into a competitive technology business. This is a **playable browser prototype**, not a completed commercial release.

## Play

1. Download this folder (or clone the repository and check out the AI Startup Tycoon branch).
2. Open \`ai-startup-tycoon/index.html\` in a modern desktop browser.
3. Launch an AI product, advance weeks, watch market demand and adjust strategy.

There is no build step, account, API key, subscription, engine installation or internet dependency. The interface is also responsive on mobile browsers.

## Available gameplay

- **Turn-based economy:** Advance one week at a time. Pay salaries, overhead and inference costs, collect subscription revenue.
- **AI research:** Progress through four successive model tiers with research time and upfront R&D expenditure.
- **Product business:** Launch an AI assistant, coding assistant, image studio and enterprise API; change monthly prices to trade growth for margin.
- **Workforce:** Hire/fire researchers, engineers and marketers. Different roles have different effects and salaries.
- **Infrastructure:** Purchase server clusters. Users are constrained by a shared capacity ceiling.
- **Competition:** Three automated rivals gain users and technology capabilities over time. Market category trends vary.
- **Investors:** Raise funding in exchange for a calculated percentage of founder equity, subject to cooldown.
- **Events:** Positive/negative market events occur every five weeks.
- **Finance:** Cash history, costs, revenues, valuation, estimated runway, growth and churn.
- **Save:** Automatic save on decisions and explicit save, using browser localStorage. Starting a new game replaces the current local save.
- **Game over:** A sufficiently negative cash balance ends the run.

All companies, market activity, and financial amounts are fictional. No actual AI model training or external APIs are involved.

## How to test

Requires Node.js 18+ only for automated tests:

\`\`\`sh
node ai-startup-tycoon/tests/engine.test.js
\`\`\`

The game itself does **not** require Node.js.

## Project layout

\`\`\`
ai-startup-tycoon/
  index.html             Browser entrypoint
  style.css              Responsive management interface
  engine.js              Pure, seeded, deterministic simulation rules
  app.js                 Screen rendering and player action handling
  tests/engine.test.js   Node.js built-in assertions
  docs/GAME_DESIGN.md    Game vision, scope and roadmap
\`\`\`

The game engine is independent of HTML and can be run directly in Node.js tests. A single user action is passed to \`AIStartupGame.dispatch(state, action, data)\`. The engine mutates the game state and returns \`{ok, message}\`.

Simulation reproducibility contract: for the same engine version, initial state/seed and ordered player actions, the resulting game state must be identical.

## Known limits of this first build

- Single save slot (local to the browser profile); no cloud synchronization.
- No sound, translations, scenarios, multiplayer, employee personalities or manual office construction.
- Rival companies are economic competitors, not full decision-making agents yet.
- Economic constants are prototype balancing values, not real-company financial predictions.
- No packaged desktop executable or Steam distribution.

## Roadmap

1. **v0.1:** Playable company-management core, tests, readable UI (this prototype).
2. **v0.2:** Better competitor decision-making, company specialization, richer event choices.
3. **v0.3:** Model training choices (speed/cost/quality), improved churn and demand modeling, analytics and balance simulation.
4. **v0.4:** Multiple saving slots, scenario/seed selection, onboarding, accessibility, localization.
5. **v0.5:** Production-ready asset pipeline, audio, settings and desktop packaging decision.

Build the economic game first; only add 3D office construction if it makes strategic choices more engaging.

## License

No additional license is assigned to this prototype in the repository. The existing root-level project is unrelated and remains untouched.
