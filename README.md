# Folio — Library Management System

A React and JavaScript library dashboard built around modular object-oriented classes and design patterns.

## Features

- Browse and search the book catalog.
- Add books and student or teacher members.
- Check books out to members and record returns.
- Review current checkouts and overdue loans.
- Simulate due-date checks and notify the relevant borrower.
- Dashboard with collection, member, and loan activity summaries.
- Responsive layout for desktop, tablet, and mobile.

The application seeds a small sample collection and a few sample members the first time it runs. The UI uses the library classes in `src/library/`: `UserFactory` creates members, `LibrarySystem` is a Singleton, and `NotificationService` implements overdue notifications using the Observer pattern.

## Run locally

Requires Node.js 18 or newer.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Run the library-model tests with `npm test` and create a production build with `npm run build`.
