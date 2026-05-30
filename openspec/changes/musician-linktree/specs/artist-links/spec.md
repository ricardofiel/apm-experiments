## ADDED Requirements

### Requirement: Link persistence
The system SHALL persist links belonging to an artist, each with a label, URL, optional icon identifier, and an integer position used for ordering.

#### Scenario: Create link for artist
- **WHEN** a client POSTs to `/api/artists/jane-doe/links` with `{ label: "Spotify", url: "https://open.spotify.com/artist/…", icon: "spotify" }`
- **THEN** the system creates a link row associated with that artist, assigns it `position = max(existing positions) + 1` (or `0` if none), and responds `201` with the created link including `id`, `artistId`, `position`, `createdAt`, `updatedAt`

#### Scenario: Reject link with invalid URL
- **WHEN** a client POSTs a link with a `url` that does not parse as a valid `http`/`https` URL
- **THEN** the system responds `400` with `{ error: { code: "INVALID_URL", message: ... } }`

#### Scenario: Reject link with missing label
- **WHEN** a client POSTs a link without a non-empty `label`
- **THEN** the system responds `400` with `{ error: { code: "INVALID_INPUT", message: ... } }`

#### Scenario: Reject link for unknown artist
- **WHEN** a client POSTs `/api/artists/does-not-exist/links` with otherwise valid fields
- **THEN** the system responds `404` with `{ error: { code: "NOT_FOUND", message: ... } }`

### Requirement: List links for an artist
The system SHALL return all links for a given artist ordered by `position` ascending.

#### Scenario: List ordered links
- **WHEN** a client GETs `/api/artists/jane-doe/links` and the artist has links at positions `0, 1, 2`
- **THEN** the system responds `200` with an array of three link objects sorted by `position` ascending

#### Scenario: List for artist with no links
- **WHEN** a client GETs `/api/artists/jane-doe/links` and the artist exists but has no links
- **THEN** the system responds `200` with an empty array `[]`

### Requirement: Update a link
The system SHALL allow partial updates to a link's `label`, `url`, and `icon`.

#### Scenario: Update link label
- **WHEN** a client PATCHes `/api/links/42` with `{ label: "Spotify · Latest single" }`
- **THEN** the system updates the row, refreshes `updatedAt`, and responds `200` with the updated link

#### Scenario: Update link with invalid URL
- **WHEN** a client PATCHes `/api/links/42` with `{ url: "not-a-url" }`
- **THEN** the system responds `400` with `{ error: { code: "INVALID_URL" } }` and does not change the row

### Requirement: Delete a link
The system SHALL allow deleting a single link by id without affecting other links or the parent artist.

#### Scenario: Delete an existing link
- **WHEN** a client DELETEs `/api/links/42`
- **THEN** the system responds `204` and only the row with `id = 42` is removed

### Requirement: Reorder an artist's links
The system SHALL atomically reorder an artist's links so that the supplied id sequence becomes positions `0..n-1`.

#### Scenario: Reorder with full id list
- **WHEN** a client POSTs `/api/artists/jane-doe/links/reorder` with `{ order: [3, 1, 2] }` and the artist owns exactly links `1`, `2`, `3`
- **THEN** the system updates positions so link `3` is at position `0`, link `1` at `1`, link `2` at `2`, all in a single transaction, and responds `200` with the reordered link array

#### Scenario: Reject reorder with missing or foreign ids
- **WHEN** a client POSTs `/api/artists/jane-doe/links/reorder` with an `order` array that omits one of the artist's link ids or includes an id not owned by that artist
- **THEN** the system responds `400` with `{ error: { code: "INVALID_ORDER" } }` and does not modify any rows
