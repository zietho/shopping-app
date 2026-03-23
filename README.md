# ShopList

A collaborative, real-time shopping list app built for mobile. Create and manage shopping lists, share them with others, and use a dedicated shopping mode to check off items while in the store.

---

## Features

### Lists
- Create and manage multiple shopping lists
- Add items via quick-select chips or custom input (comma-separated bulk entry supported)
- Edit item names and quantities inline
- Swipe to delete items
- Reorder items by position
- Save any list as a reusable template

### Shopping Mode
- Select a list and enter shopping mode
- Check off items as you add them to your cart
- Visual progress bar showing completion percentage
- Auto-completes when all items are checked
- Option to keep or discard unchecked items after finishing

### Sharing & Collaboration
- Share any list via a unique 8-character invite code
- Join a shared list by entering a code or visiting a share link (`?join=CODE`)
- Real-time sync — changes from any member appear instantly for all
- Role-based access: owners can delete lists and generate codes; members can add and edit items
- Invite links work even before login — the join is completed after authentication

### Templates
- Save frequently used item sets as templates
- Mark templates as favorites for quick access
- Apply a template to any active list with one tap
- Edit and delete templates

### Settings & Preferences
- Dark and light theme (persisted per device)
- Language selection: German, English, French, Spanish (auto-detected from browser)
- Profile with username and avatar color
- Usage statistics (lists, items, templates count)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + CSS custom properties |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Icons | lucide-react + custom emoji mapping |
| State | React Context API |

---

## Project Structure

```
src/
├── contexts/         # Auth, App, Theme, Language state
├── screens/          # Full-page views
│   ├── LoginScreen.tsx
│   ├── ListScreen.tsx
│   ├── ShoppingSection.tsx
│   ├── ShoppingRunScreen.tsx
│   ├── TemplatesScreen.tsx
│   └── SettingsScreen.tsx
├── components/
│   ├── layout/       # TopBar, BottomNav, PresenceBar
│   ├── list/         # ItemRow, AddBar
│   ├── sharing/      # ShareModal, JoinListModal
│   ├── templates/    # TemplateModal
│   ├── shopping/     # ShoppingProgressBar
│   └── common/       # Modal, Toast
├── lib/              # Supabase client, item icons, i18n
├── types/            # TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css
```

---

## Database Schema (Supabase)

| Table | Purpose |
|---|---|
| `profiles` | Username and avatar color per user |
| `lists` | Shopping lists |
| `items` | Items belonging to a list |
| `templates` | Saved item templates |
| `template_items` | Items within a template |
| `list_members` | Access control (owner / member roles) |
| `share_invites` | Invite codes with 30-day expiry |
| `user_presence` | Tracks active users per list |

Row-Level Security (RLS) is enabled on all tables — users can only access lists they are members of.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### Install

```bash
npm install
```

### Configure

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run the database migrations

Apply the SQL migrations in the `supabase/` folder to your Supabase project.

### Start

```bash
npm run dev
```

### Build

```bash
npm run build
```

---

## Authentication

Users register with a username and password. Emails are handled internally (`username@shoplist.app`). Sessions persist across reloads via Supabase's built-in session management.

---

## Internationalization

The app supports four languages:

- 🇩🇪 German (default)
- 🇬🇧 English
- 🇫🇷 French
- 🇪🇸 Spanish

Language is auto-detected from the browser and can be changed in Settings. Item name-to-emoji mapping is also language-aware, covering 80+ common grocery items.
