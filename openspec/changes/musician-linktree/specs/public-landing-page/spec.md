## ADDED Requirements

### Requirement: Public landing page route
The system SHALL serve a public HTML landing page for an artist at `GET /:handle` for any handle that is not a reserved path.

#### Scenario: Serve landing page for existing artist
- **WHEN** a browser GETs `/jane-doe` and `jane-doe` exists
- **THEN** the server responds `200` with `text/html` containing the landing page shell, which on load fetches `/api/artists/jane-doe` and `/api/artists/jane-doe/links` and renders the artist's avatar, display name, bio, and link buttons

#### Scenario: Serve landing page shell for unknown artist
- **WHEN** a browser GETs `/does-not-exist`
- **THEN** the server responds `200` with the same HTML shell, and the client renders a "Artist not found" empty state after the API call returns `404`

#### Scenario: Reserved paths are not treated as handles
- **WHEN** a browser GETs `/api`, `/admin`, `/assets`, `/css`, or `/js`
- **THEN** the server does NOT serve the landing page shell for that path; those paths are routed to the API or static assets as appropriate

### Requirement: Mobile-first responsive layout
The landing page SHALL be mobile-first and render correctly from a 320 px viewport up to desktop widths without horizontal scrolling.

#### Scenario: Render at narrow viewport
- **WHEN** the page is rendered at a 360 × 640 viewport
- **THEN** the avatar, name, bio, and link buttons are arranged in a single vertical column with no horizontal overflow

#### Scenario: Render at desktop viewport
- **WHEN** the page is rendered at a 1280 × 800 viewport
- **THEN** the content remains centered with a constrained maximum content width and comfortable margins

### Requirement: Tap-friendly link buttons
Each rendered link SHALL be a touch target at least 44 × 44 CSS pixels and open the target URL in a new tab with `rel="noopener noreferrer"`.

#### Scenario: Tap a link
- **WHEN** the page renders a link and the user taps it
- **THEN** the browser opens the link's `url` in a new tab and the opener cannot reach `window.opener`

#### Scenario: Touch target sizing
- **WHEN** the page renders any link button
- **THEN** the button's computed bounding box is at least 44 × 44 CSS pixels

### Requirement: Apple-inspired visual style
The landing page SHALL apply an Apple-inspired visual style using only generic system font stacks and project-owned CSS (no Apple-owned font files, logos, or assets).

#### Scenario: Typography uses system font stack
- **WHEN** the page renders text
- **THEN** the computed `font-family` stack begins with `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`

#### Scenario: Rounded, soft-shadowed components
- **WHEN** the page renders link buttons and the avatar
- **THEN** link buttons have a border radius of at least 12 px and a soft shadow, and the avatar is a circle (border radius 50%)

#### Scenario: Adaptive light/dark color scheme
- **WHEN** the user's OS color scheme is dark
- **THEN** the page renders with a dark background and high-contrast foreground text driven by `@media (prefers-color-scheme: dark)`

### Requirement: Empty and loading states
The page SHALL show explicit loading and empty states rather than a blank screen.

#### Scenario: Loading state
- **WHEN** the API requests are in flight
- **THEN** the page shows a centered loading indicator

#### Scenario: Artist not found
- **WHEN** the artist API returns `404`
- **THEN** the page shows a "Artist not found" message and no link buttons

#### Scenario: Artist with no links
- **WHEN** the artist exists but the links API returns an empty array
- **THEN** the page shows the artist's profile and a subtle "No links yet" message in place of the link list
