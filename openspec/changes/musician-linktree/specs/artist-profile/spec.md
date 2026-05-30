## ADDED Requirements

### Requirement: Artist profile persistence
The system SHALL persist an artist profile record with a unique handle, a display name, an optional bio, and an optional avatar URL.

#### Scenario: Create artist with valid fields
- **WHEN** a client POSTs to `/api/artists` with `{ handle: "jane-doe", displayName: "Jane Doe", bio: "…", avatarUrl: "https://…" }`
- **THEN** the system creates a new artist row and responds `201` with the created artist including a numeric `id`, `createdAt`, and `updatedAt`

#### Scenario: Reject duplicate handle
- **WHEN** a client POSTs `/api/artists` with a `handle` that already exists
- **THEN** the system responds `409` with `{ error: { code: "HANDLE_TAKEN", message: ... } }` and does not create a new row

#### Scenario: Reject invalid handle format
- **WHEN** a client POSTs `/api/artists` with a `handle` that does not match `^[a-z0-9][a-z0-9-_]{1,29}$`
- **THEN** the system responds `400` with `{ error: { code: "INVALID_HANDLE", message: ... } }`

#### Scenario: Reject missing display name
- **WHEN** a client POSTs `/api/artists` without a non-empty `displayName`
- **THEN** the system responds `400` with `{ error: { code: "INVALID_INPUT", message: ... } }`

### Requirement: Artist profile retrieval
The system SHALL allow retrieving an artist profile by handle.

#### Scenario: Fetch existing artist
- **WHEN** a client GETs `/api/artists/jane-doe` and that artist exists
- **THEN** the system responds `200` with the artist's `id`, `handle`, `displayName`, `bio`, `avatarUrl`, `createdAt`, `updatedAt`

#### Scenario: Fetch unknown artist
- **WHEN** a client GETs `/api/artists/does-not-exist`
- **THEN** the system responds `404` with `{ error: { code: "NOT_FOUND", message: ... } }`

### Requirement: Artist profile update
The system SHALL allow partial updates to an artist's `displayName`, `bio`, `avatarUrl`, and `handle`.

#### Scenario: Update display name
- **WHEN** a client PATCHes `/api/artists/jane-doe` with `{ displayName: "Jane D." }`
- **THEN** the system updates the row, refreshes `updatedAt`, and responds `200` with the updated artist

#### Scenario: Rename handle to an available value
- **WHEN** a client PATCHes `/api/artists/jane-doe` with `{ handle: "jane-d" }` and no other artist uses `jane-d`
- **THEN** the system updates the handle and responds `200`; subsequent GETs at `/api/artists/jane-d` succeed and GETs at `/api/artists/jane-doe` return `404`

#### Scenario: Rename handle to a taken value
- **WHEN** a client PATCHes `/api/artists/jane-doe` with `{ handle: "other-artist" }` and `other-artist` already exists
- **THEN** the system responds `409` with `{ error: { code: "HANDLE_TAKEN" } }` and does not change the row

### Requirement: Artist deletion cascades to links
The system SHALL delete an artist and all of that artist's links atomically.

#### Scenario: Delete artist with links
- **WHEN** a client DELETEs `/api/artists/jane-doe` and that artist has any links
- **THEN** the system responds `204`, the artist row is removed, and all rows in `links` where `artist_id` matched are also removed

### Requirement: List all artists
The system SHALL expose an endpoint that returns all artists.

#### Scenario: List with multiple artists
- **WHEN** a client GETs `/api/artists`
- **THEN** the system responds `200` with an array of artist objects ordered by `displayName` ascending
