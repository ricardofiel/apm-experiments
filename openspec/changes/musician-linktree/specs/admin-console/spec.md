## ADDED Requirements

### Requirement: Admin console route
The system SHALL serve an HTML admin console at `GET /admin` (and `GET /` in this iteration).

#### Scenario: Serve admin console
- **WHEN** a browser GETs `/admin`
- **THEN** the server responds `200` with `text/html` containing the admin console shell that loads Bootstrap, jQuery, and the admin JavaScript bundle

### Requirement: Manage artists from the admin console
The admin console SHALL allow creating, selecting, editing, and deleting artists by calling the public REST API; no authentication is performed.

#### Scenario: Create artist
- **WHEN** the user fills the "New artist" form with a handle and display name and submits
- **THEN** the console calls `POST /api/artists`, and on `201` it appends the artist to the artist list and selects it

#### Scenario: Edit artist
- **WHEN** the user selects an artist, edits `displayName`, `bio`, or `avatarUrl` in the edit form, and submits
- **THEN** the console calls `PATCH /api/artists/:handle` with only the changed fields and updates the displayed values on `200`

#### Scenario: Delete artist with confirmation
- **WHEN** the user clicks "Delete" on the selected artist and confirms the prompt
- **THEN** the console calls `DELETE /api/artists/:handle` and on `204` removes the artist from the list and clears the selection

#### Scenario: Surface API errors
- **WHEN** any admin API call returns a non-2xx response
- **THEN** the console displays the response's `error.message` in a dismissable alert and leaves the form values intact

### Requirement: Manage links from the admin console
The admin console SHALL allow adding, editing, reordering, and deleting links for the selected artist.

#### Scenario: Add link
- **WHEN** the user submits the "Add link" form with `label` and `url` for the selected artist
- **THEN** the console calls `POST /api/artists/:handle/links` and on `201` appends the link to the link list in `position` order

#### Scenario: Edit link
- **WHEN** the user edits a link's `label`, `url`, or `icon` and saves
- **THEN** the console calls `PATCH /api/links/:id` with only the changed fields and updates the row on `200`

#### Scenario: Reorder links via move-up / move-down controls
- **WHEN** the user clicks "Move up" or "Move down" on a link
- **THEN** the console swaps the link's position with its neighbour in memory, then calls `POST /api/artists/:handle/links/reorder` with the resulting full id list, and reverts the local change if the API returns a non-2xx response

#### Scenario: Delete link with confirmation
- **WHEN** the user clicks "Delete" on a link and confirms the prompt
- **THEN** the console calls `DELETE /api/links/:id` and on `204` removes the link from the list

### Requirement: No authentication, with safety notice
The admin console SHALL NOT prompt for credentials and the server SHALL NOT enforce authentication on any endpoint, but the admin console SHALL display a visible notice that the instance is unauthenticated.

#### Scenario: No auth challenge
- **WHEN** a user navigates to `/admin`
- **THEN** the page loads without any login or password prompt

#### Scenario: Unauthenticated-mode banner
- **WHEN** the admin console renders
- **THEN** a persistent banner at the top reads (verbatim or equivalent): "Unauthenticated mode — do not expose this server to the public internet."
