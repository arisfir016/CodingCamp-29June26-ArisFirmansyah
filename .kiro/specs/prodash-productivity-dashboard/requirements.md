# Requirements Document

## Introduction

ProDash is a client-side productivity dashboard delivered as a single-page web application. It
consolidates five core utilities — a live Greeting card, a Pomodoro-style Focus Timer, a To-Do
List, a Quick Links bookmark panel, and a Light/Dark theme toggle — into one minimal, fast-loading
interface. All user data is persisted exclusively through the browser's localStorage API; no backend
server or build toolchain is required.

---

## Glossary

- **Dashboard**: The single-page ProDash web application rendered in the user's browser.
- **Greeting_Card**: The UI section that displays the live clock, current date, time-of-day
  greeting, and personalized user name.
- **Clock**: The HH:MM live time display rendered inside the Greeting_Card.
- **Greeting_Text**: The time-of-day salutation string (e.g., "Selamat Pagi, Aris!") shown in the
  Greeting_Card.
- **Focus_Timer**: The Pomodoro-style countdown timer widget.
- **Session**: A single Focus_Timer countdown from the configured duration to zero.
- **Todo_List**: The task management widget supporting add, edit, complete, delete, sort, and
  duplicate prevention.
- **Todo_Item**: A single task entry in the Todo_List, consisting of a unique ID, text content, and
  completion status.
- **Quick_Links**: The bookmark panel that stores named URL shortcuts with favicons.
- **Link_Item**: A single bookmark entry consisting of a unique ID, display name, and URL.
- **Theme_Toggle**: The button that switches the Dashboard between light and dark visual themes.
- **Storage**: The browser's `localStorage` API used to persist all user data.
- **Favicon_Service**: The external Google Favicons API used to resolve favicon images for
  Link_Items (`https://www.google.com/s2/favicons`).
- **Toast**: The transient pop-up notification displayed at the bottom of the screen.
- **Notification**: The inline alert banner rendered within the Todo_List card.

---

## Requirements

---

### Requirement 1: Live Clock and Date Display

**User Story:** As a user, I want to see the current time and date at a glance, so that I can stay
oriented throughout my work session without leaving the Dashboard.

#### Acceptance Criteria

1. THE Clock SHALL display the current local time in HH:MM format, zero-padded.
2. WHEN a new minute begins, THE Clock SHALL update its displayed value within 1 second.
3. THE Greeting_Card SHALL display the current day name, numeric date, month name, and four-digit
   year on a single line below the Clock.
4. WHEN the Dashboard is first loaded, THE Clock SHALL display the correct local time immediately.

---

### Requirement 2: Personalized Greeting

**User Story:** As a user, I want the Dashboard to greet me by name with a time-appropriate
salutation, so that the experience feels personal and context-aware.

#### Acceptance Criteria

1. WHEN the local hour is between 05:00 and 10:59 inclusive, THE Greeting_Text SHALL begin with
   "Selamat Pagi".
2. WHEN the local hour is between 11:00 and 14:59 inclusive, THE Greeting_Text SHALL begin with
   "Selamat Siang".
3. WHEN the local hour is between 15:00 and 18:59 inclusive, THE Greeting_Text SHALL begin with
   "Selamat Sore".
4. WHEN the local hour is between 19:00 and 04:59 inclusive, THE Greeting_Text SHALL begin with
   "Selamat Malam".
5. WHEN a user name has been saved, THE Greeting_Text SHALL append ", {name}!" to the salutation
   string.
6. WHEN no user name has been saved, THE Greeting_Text SHALL display only the salutation string
   followed by "!".

---

### Requirement 3: Persistent User Name

**User Story:** As a user, I want to save my name so that it persists across browser sessions and
page reloads.

#### Acceptance Criteria

1. THE Greeting_Card SHALL provide a text input field accepting a maximum of 30 characters for the
   user's name.
2. WHEN the user clicks the Save button, THE Dashboard SHALL persist the entered name to Storage
   under the key `prodash_name`.
3. WHEN the user presses the Enter key while the name input is focused, THE Dashboard SHALL persist
   the entered name to Storage under the key `prodash_name`.
4. WHEN the Dashboard is loaded and Storage contains a value for `prodash_name`, THE Greeting_Card
   SHALL pre-populate the name input with the stored value.
5. WHEN the user saves an empty string as the name, THE Dashboard SHALL store the empty string and
   THE Greeting_Text SHALL display only the salutation without a name suffix.

---

### Requirement 4: Focus Timer — Configuration

**User Story:** As a user, I want to configure the Focus Timer duration, so that I can adapt the
session length to my work style.

#### Acceptance Criteria

1. THE Focus_Timer SHALL accept a duration input in whole minutes with a minimum of 1 and a maximum
   of 120.
2. WHEN the user clicks the Set button or presses Enter in the duration input, THE Focus_Timer SHALL
   apply the entered duration, reset the countdown to that duration, and stop any running Session.
3. WHEN the entered duration is less than 1, THE Focus_Timer SHALL clamp the value to 1 minute.
4. WHEN the entered duration is greater than 120, THE Focus_Timer SHALL clamp the value to 120
   minutes.
5. WHEN the entered duration is not a valid integer, THE Focus_Timer SHALL default to 25 minutes.
6. WHEN the Dashboard is loaded and Storage contains a value for `prodash_duration`, THE Focus_Timer
   SHALL initialize to the stored duration.
7. WHEN a valid duration is applied, THE Focus_Timer SHALL persist the duration to Storage under the
   key `prodash_duration`.

---

### Requirement 5: Focus Timer — Session Control

**User Story:** As a user, I want to start, pause, and reset the Focus Timer, so that I can
control my focus sessions flexibly.

#### Acceptance Criteria

1. WHEN the user clicks the Start button and no Session is running, THE Focus_Timer SHALL begin
   counting down one second per second from the current remaining time.
2. WHILE a Session is running, THE Focus_Timer SHALL disable the Start button and enable the Stop
   button.
3. WHILE no Session is running, THE Focus_Timer SHALL enable the Start button and disable the Stop
   button.
4. WHEN the user clicks the Stop button during a running Session, THE Focus_Timer SHALL pause the
   countdown and retain the remaining time.
5. WHEN the user clicks the Reset button, THE Focus_Timer SHALL stop any running Session and reset
   the countdown to the currently configured duration.
6. WHEN the remaining time reaches zero, THE Focus_Timer SHALL stop the countdown, update its
   display to 00:00, and display a completion status message.
7. WHEN the Start button is clicked while remaining time is zero, THE Focus_Timer SHALL not start a
   new countdown.

---

### Requirement 6: Focus Timer — Visual Feedback

**User Story:** As a user, I want visual indicators of timer progress, so that I can gauge my
remaining focus time at a glance.

#### Acceptance Criteria

1. THE Focus_Timer SHALL display a progress bar that represents the ratio of remaining time to total
   session duration.
2. WHEN a Session is running, THE progress bar width SHALL decrease continuously from 100% to 0%
   over the Session duration.
3. WHEN the Focus_Timer is reset, THE progress bar SHALL return to 100% width.
4. WHEN a Session completes, THE Focus_Timer SHALL display a Toast notification informing the user
   that the focus session has ended.
5. WHEN a Session is running, THE timer display SHALL apply the running visual style (accent colour).
6. WHEN a Session completes, THE timer display SHALL apply the done visual style (success colour).

---

### Requirement 7: To-Do List — Adding Tasks

**User Story:** As a user, I want to add tasks to a list, so that I can track what I need to
accomplish.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a text input field accepting a maximum of 100 characters for the task
   description.
2. WHEN the user clicks the Add button or presses Enter in the task input, THE Todo_List SHALL
   create a new Todo_Item with a unique ID, the trimmed input text, and a `completed: false` status.
3. WHEN a new Todo_Item is created, THE Todo_List SHALL persist the updated list to Storage under
   the key `prodash_todos`.
4. WHEN a new Todo_Item is created, THE task input SHALL be cleared and focus SHALL return to the
   task input field.
5. WHEN the task input is empty or contains only whitespace, THE Todo_List SHALL display an error
   Notification and SHALL NOT create a Todo_Item.
6. WHEN the trimmed task text matches an existing Todo_Item's text (case-insensitive), THE Todo_List
   SHALL display a duplicate-warning Notification and SHALL NOT create a new Todo_Item.

---

### Requirement 8: To-Do List — Completing and Deleting Tasks

**User Story:** As a user, I want to mark tasks as done and remove tasks I no longer need, so that
I can maintain an accurate and tidy task list.

#### Acceptance Criteria

1. WHEN the user checks the checkbox of a Todo_Item, THE Todo_List SHALL toggle the `completed`
   field of that Todo_Item and persist the updated list to Storage.
2. WHEN a Todo_Item is marked completed, THE Dashboard SHALL apply a visual struck-through style and
   reduced opacity to that Todo_Item.
3. WHEN the user clicks the Delete button of a Todo_Item, THE Todo_List SHALL remove that
   Todo_Item from the list and persist the updated list to Storage.
4. WHEN the Todo_List contains no Todo_Items, THE Dashboard SHALL display an empty-state message in
   place of the list.
5. THE Todo_List SHALL display a count summary showing the number of completed tasks out of the
   total task count.

---

### Requirement 9: To-Do List — Editing Tasks

**User Story:** As a user, I want to edit existing task text, so that I can correct or update tasks
without deleting and re-adding them.

#### Acceptance Criteria

1. WHEN the user clicks the Edit button of a Todo_Item, THE Dashboard SHALL open a modal dialog
   pre-populated with the current task text.
2. WHEN the user clicks the Save button in the edit modal, THE Todo_List SHALL update the Todo_Item
   text to the trimmed new value and persist the updated list to Storage.
3. WHEN the user presses Enter while the edit input is focused, THE Todo_List SHALL save the edit
   as if the Save button were clicked.
4. WHEN the user clicks the Cancel button or presses Escape in the edit modal, THE Dashboard SHALL
   close the modal without modifying the Todo_Item.
5. WHEN the user clicks outside the modal dialog area, THE Dashboard SHALL close the modal without
   modifying the Todo_Item.
6. WHEN the edited text (case-insensitive) matches any other existing Todo_Item's text, THE
   Todo_List SHALL display a duplicate-warning Notification and SHALL NOT save the edit.
7. WHEN the edited text is empty or contains only whitespace, THE Todo_List SHALL not save the edit.

---

### Requirement 10: To-Do List — Sorting

**User Story:** As a user, I want to sort my task list, so that I can quickly find tasks or
prioritise incomplete work.

#### Acceptance Criteria

1. WHEN the user clicks the A-Z Sort button, THE Todo_List SHALL sort all Todo_Items
   alphabetically ascending by task text (locale-aware, case-insensitive) and persist the sorted
   order to Storage.
2. WHEN the user clicks the Status Sort button, THE Todo_List SHALL sort Todo_Items so that
   incomplete tasks appear before completed tasks, with each group sorted alphabetically, and
   persist the sorted order to Storage.
3. WHEN the Dashboard is loaded, THE Todo_List SHALL display Todo_Items in the order they are
   stored in Storage.

---

### Requirement 11: To-Do List — Persistence

**User Story:** As a user, I want my task list to survive page reloads, so that I do not lose my
tasks between sessions.

#### Acceptance Criteria

1. WHEN the Dashboard is loaded and Storage contains a value for `prodash_todos`, THE Todo_List
   SHALL restore and render all stored Todo_Items.
2. WHEN Storage contains no value for `prodash_todos`, THE Todo_List SHALL initialize with an empty
   list.
3. THE Todo_List SHALL persist after every mutation (add, toggle, edit, delete, sort) by writing
   the complete current list to Storage under the key `prodash_todos`.

---

### Requirement 12: Quick Links — Adding Bookmarks

**User Story:** As a user, I want to save named website shortcuts, so that I can open frequently
visited sites directly from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide a name input field (maximum 30 characters) and a URL input field
   for adding new Link_Items.
2. WHEN the user submits a new link with a non-empty name and a valid URL, THE Quick_Links SHALL
   create a Link_Item with a unique ID, the trimmed name, and the normalized URL.
3. WHEN the submitted URL does not begin with `http://` or `https://`, THE Quick_Links SHALL
   prepend `https://` before storing it.
4. WHEN the submitted URL is not a parseable URL after normalization, THE Dashboard SHALL display an
   error message and SHALL NOT create a Link_Item.
5. WHEN the name field is empty, THE Dashboard SHALL display an error message and SHALL NOT create a
   Link_Item.
6. WHEN a Link_Item is created, THE Quick_Links SHALL persist the updated list to Storage under the
   key `prodash_links` and clear the input fields.
7. WHEN the user presses Enter in the name input, focus SHALL move to the URL input field.
8. WHEN the user presses Enter in the URL input field, THE Dashboard SHALL attempt to add the link.

---

### Requirement 13: Quick Links — Display and Navigation

**User Story:** As a user, I want to see my bookmarks as visual tiles with favicons, so that I can
identify and open links quickly.

#### Acceptance Criteria

1. THE Quick_Links SHALL render each Link_Item as a clickable tile displaying the site favicon and
   the link name.
2. WHEN the user clicks a Link_Item tile, THE Dashboard SHALL open the associated URL in a new
   browser tab.
3. THE Quick_Links SHALL request the favicon for each Link_Item from the Favicon_Service using the
   origin domain of the stored URL.
4. IF the favicon image fails to load, THE Quick_Links SHALL hide the favicon element and display
   only the link name.
5. WHEN the Quick_Links list contains no Link_Items, THE Dashboard SHALL display an empty-state
   message.

---

### Requirement 14: Quick Links — Deleting Bookmarks

**User Story:** As a user, I want to remove bookmarks I no longer need, so that the Quick Links
panel stays relevant.

#### Acceptance Criteria

1. WHEN the user hovers over a Link_Item tile, THE Dashboard SHALL reveal a Delete button on that
   tile.
2. WHEN the user clicks the Delete button on a Link_Item tile, THE Quick_Links SHALL remove that
   Link_Item and persist the updated list to Storage under the key `prodash_links`.
3. WHEN the Delete button is clicked, THE Dashboard SHALL not navigate to the link URL.

---

### Requirement 15: Quick Links — Persistence

**User Story:** As a user, I want my bookmarks to survive page reloads, so that I do not need to
re-enter them each session.

#### Acceptance Criteria

1. WHEN the Dashboard is loaded and Storage contains a value for `prodash_links`, THE Quick_Links
   SHALL restore and render all stored Link_Items.
2. WHEN Storage contains no value for `prodash_links`, THE Quick_Links SHALL initialize with an
   empty list.

---

### Requirement 16: Light / Dark Theme Toggle

**User Story:** As a user, I want to switch between light and dark visual themes, so that I can
work comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL switch the Dashboard between the light theme and the dark theme each time
   it is clicked.
2. WHEN the Dashboard is in light mode, THE Theme_Toggle button SHALL display a dark-mode icon and
   label.
3. WHEN the Dashboard is in dark mode, THE Theme_Toggle button SHALL display a light-mode icon and
   label.
4. WHEN the theme is changed, THE Dashboard SHALL persist the active theme to Storage under the key
   `prodash_theme`.
5. WHEN the Dashboard is loaded and Storage contains a value for `prodash_theme`, THE Dashboard
   SHALL apply the stored theme immediately on render.
6. WHEN the Dashboard is loaded and Storage contains no value for `prodash_theme`, THE Dashboard
   SHALL apply the light theme by default.

---

### Requirement 17: Responsive Layout

**User Story:** As a user, I want the Dashboard to be usable on screens of different sizes, so that
I can access it on both desktop and mobile devices.

#### Acceptance Criteria

1. WHEN the viewport width is greater than 900px, THE Dashboard SHALL render the Greeting_Card and
   Focus_Timer in a two-column grid row, and the Todo_List and Quick_Links in a second two-column
   grid row.
2. WHEN the viewport width is 900px or less, THE Dashboard SHALL render all four widget cards in a
   single-column layout.
3. WHEN the viewport width is 600px or less, THE Dashboard SHALL apply compact padding, reduced font
   sizes, and full-width buttons to preserve usability on small screens.
4. THE Dashboard SHALL use a sticky top navigation bar that remains visible when the user scrolls
   down the page.

---

### Requirement 18: Technical Constraints

**User Story:** As a developer, I want the Dashboard built with plain web technologies and no
server dependency, so that it can be deployed as a simple file bundle or browser extension.

#### Acceptance Criteria

**TC-1 — Technology Stack**

1. THE Dashboard SHALL be implemented using HTML for structure, CSS for styling, and vanilla
   JavaScript for behaviour, with no JavaScript frameworks (React, Vue, Angular, or equivalent).
2. THE Dashboard SHALL require no build tool, bundler, transpiler, or package manager to run.
3. THE Dashboard SHALL require no backend server; all functionality SHALL operate entirely in the
   user's browser.

**TC-2 — Data Storage**

4. THE Dashboard SHALL store all persistent user data exclusively through the browser localStorage
   API.
5. THE Dashboard SHALL not transmit any user data to any external server.

**TC-3 — Browser Compatibility**

6. THE Dashboard SHALL function correctly in the current stable releases of Chrome, Firefox, Edge,
   and Safari.
7. THE Dashboard SHALL be usable as a standalone web page opened directly from the filesystem or
   served via a static file server.

---

### Requirement 19: Non-Functional Requirements

**User Story:** As a user, I want the Dashboard to be fast, clean, and easy to understand at
first glance, so that it integrates naturally into my daily workflow.

#### Acceptance Criteria

**NFR-1 — Simplicity**

1. THE Dashboard SHALL present a clean, minimal interface with no complex onboarding or setup steps
   required.
2. THE Dashboard SHALL require no test framework setup or developer tooling to load in a browser.

**NFR-2 — Performance**

3. THE Dashboard SHALL complete initial render in under 2 seconds on a modern device with a local
   or cached file.
4. WHEN the user interacts with any widget (adds a task, clicks a button, types in an input), THE
   Dashboard SHALL reflect the state change in the UI within 100 milliseconds.
5. WHEN the user switches themes, THE Dashboard SHALL apply the new theme within 200 milliseconds
   using CSS transitions.

**NFR-3 — Visual Design**

6. THE Dashboard SHALL maintain a consistent visual hierarchy with clear typographic scale,
   sufficient colour contrast, and distinct interactive states (hover, focus, disabled) across all
   widgets.
7. THE Dashboard SHALL apply a cohesive colour theme for both light and dark modes using CSS custom
   properties.
8. WHEN a user-facing error occurs (empty input, duplicate task, invalid URL), THE Dashboard SHALL
   communicate the error with an appropriately styled inline Notification or alert, not a bare
   `window.alert()` call (except for Quick Links URL validation which may use `window.alert()`
   as an interim measure).

---

## Correctness Properties

The following properties define correctness invariants suitable for property-based testing of the
JavaScript logic. They are organized by module.

> **Note on scope**: Because ProDash is a pure client-side vanilla-JS application with no build
> tool, all correctness properties below target pure-function logic that can be extracted and tested
> in isolation (e.g., using Hypothesis via a thin Python shim, or fast-check / QuickCheck with a
> minimal Node.js harness). They do not cover DOM rendering or localStorage I/O, which are better
> verified by integration tests with 2–3 representative examples.

---

### P1 — Todo Duplicate Detection is Symmetric (Metamorphic)

For any two non-empty strings `a` and `b`, the duplicate check result is the same regardless of
which string is the "existing" item and which is the "new" item:

```
isDuplicate([a], b) ↔ isDuplicate([b], a)
```

This verifies that duplicate detection does not depend on insertion order.

---

### P2 — Todo Duplicate Detection is Case-Insensitive (Invariant)

For any task text `t` and any case-transformation function `caseTransform` (toUpperCase,
toLowerCase, random mixed-case):

```
isDuplicate([t], caseTransform(t)) === true
```

---

### P3 — Todo Sort A-Z is Idempotent

Applying the A-Z sort twice produces the same result as applying it once:

```
sortAlphaAZ(sortAlphaAZ(todos)) deep-equals sortAlphaAZ(todos)
```

---

### P4 — Todo Sort Preserves All Items (Invariant)

For any sort operation (`sortAlphaAZ` or `sortByStatus`):

```
sort(todos).length === todos.length
∀ item ∈ todos: ∃ item' ∈ sort(todos) such that item'.id === item.id
```

Sorting must not lose, duplicate, or mutate any Todo_Item.

---

### P5 — Todo Sort Status Groups Invariant

After a status sort, for all adjacent pairs `(a, b)` in the result:

```
¬(a.completed === false ∧ b.completed === true)
```

Incomplete items always precede completed items.

---

### P6 — Timer Duration Clamping is Idempotent

For any integer `n`:

```
clamp(clamp(n)) === clamp(n)
```

where `clamp(n) = max(1, min(120, n))`. Clamping an already-clamped value has no further effect.

---

### P7 — Timer Progress Bar Ratio is Bounded

For any `remaining` in `[0, totalSeconds]` and `totalSeconds > 0`:

```
0.0 ≤ progressPercent(remaining, totalSeconds) ≤ 100.0
```

The progress bar percentage never exceeds 100% or goes below 0%.

---

### P8 — Greeting Salutation Covers All 24 Hours (Completeness)

For every integer `hour` in `[0, 23]`, the `getGreeting(hour)` function returns exactly one of:
`"Selamat Pagi"`, `"Selamat Siang"`, `"Selamat Sore"`, `"Selamat Malam"`.

No hour maps to `undefined` or an empty string.

---

### P9 — URL Normalization Round-Trip (Idempotence)

For any URL string `u` that is already a valid absolute URL:

```
normalizeUrl(normalizeUrl(u)) === normalizeUrl(u)
```

Normalizing an already-normalized URL has no additional effect.

---

### P10 — URL Normalization Produces Valid URLs (Invariant)

For any non-empty string `u` that does not begin with a scheme:

```
new URL(normalizeUrl(u)) does not throw
```

The normalizer always produces a string that the `URL` constructor can parse successfully.

---

### P11 — Storage Round-Trip (Round-Trip Property)

For any serializable value `v` (string, number, array, object):

```
storage.get(key, null) === v
```

after `storage.set(key, v)` has been called. The Storage helper must preserve values through
`JSON.stringify` / `JSON.parse` without data loss.

---

### P12 — Todo ID Uniqueness After Bulk Add (Invariant)

After adding `n` Todo_Items in sequence, all IDs in the resulting list are distinct:

```
new Set(todos.map(t => t.id)).size === todos.length
```

The `genId()` function must not produce collisions across any realistic sequence of calls.
