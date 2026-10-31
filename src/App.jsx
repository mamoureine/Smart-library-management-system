import { useMemo, useReducer, useState } from "react";
import {
  Book,
  LibrarySystem,
  UserFactory,
} from "./library/index.js";

const library = LibrarySystem.getInstance();

const starterBooks = [
  ["BK-001", "The Creative Act", "Rick Rubin", "Creativity"],
  ["BK-002", "Atomic Habits", "James Clear", "Personal growth"],
  ["BK-003", "The Design of Everyday Things", "Don Norman", "Design"],
  ["BK-004", "Deep Work", "Cal Newport", "Productivity"],
  ["BK-005", "Educated", "Tara Westover", "Memoir"],
  ["BK-006", "The Midnight Library", "Matt Haig", "Fiction"],
];

const starterMembers = [
  ["MB-001", "Aissatou Diop", "aissatou.diop@example.com", "student"],
  ["MB-002", "Cheikh Diop", "cheikh.diop@example.com", "teacher"],
  ["MB-003", "Macky Sall", "macky.sall@example.com", "student"],
  ["MB-004", "Bassirou Faye", "bassirou.faye@example.com", "teacher"],
];

function seedLibrary() {
  if (library.getBooks().length || library.getUsers().length) return;
  for (const [id, name, email, role] of starterMembers) {
    library.addUser(UserFactory.createUser(role, id, name, email));
  }
  for (const [id, title, author, category] of starterBooks) {
    const book = new Book(id, title, author);
    book.category = category;
    library.addBook(book);
  }
}

function Icon({ name, size = 18 }) {
  const shared = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  const paths = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h7" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    loan: <><path d="M7 3h10v18l-5-3-5 3z" /><path d="M10 8h4M10 12h4" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    back: <><path d="m15 18-6-6 6-6" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z" /></>,
  };
  return <svg {...shared}>{paths[name]}</svg>;
}

function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function App() {
  seedLibrary();
  const [, refresh] = useReducer((value) => value + 1, 0);
  const [page, setPage] = useState("Overview");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

  const books = library.getBooks();
  const users = library.getUsers();
  const transactions = library.getTransactions();
  const activeTransactions = transactions.filter((item) => !item.returned);
  const overdueTransactions = activeTransactions.filter((item) => item.overdue);
  const availableBooks = books.filter((book) => book.available);
  const currentUser = users[0];
  const greetingName = currentUser?.name.split(" ")[0] || "there";

  const filteredBooks = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return books;
    return books.filter((book) =>
      [book.title, book.author, book.category, book.id]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [books, query]);

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const visibleLoans = transactions.filter((transaction) => {
    if (page === "Overdue") return transaction.overdue && !transaction.returned;
    if (page === "Borrowing") return !transaction.returned;
    return true;
  });

  function showModal(type, book = null) {
    setFormError("");
    setSelectedBook(book);
    setModal(type);
  }

  function closeModal() {
    setModal(null);
    setSelectedBook(null);
    setFormError("");
  }

  function handleAddBook(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const id = `BK-${globalThis.crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const book = new Book(id, form.get("title"), form.get("author"));
      book.category = String(form.get("category") || "General").trim() || "General";
      library.addBook(book);
      refresh();
      closeModal();
      setNotice("Book added to your collection.");
    } catch (error) {
      setFormError(error.message);
    }
  }

  function handleAddMember(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const id = `MB-${globalThis.crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const member = UserFactory.createUser(
        form.get("role"),
        id,
        form.get("name"),
        form.get("email"),
      );
      library.addUser(member);
      refresh();
      closeModal();
      setNotice("New member added successfully.");
    } catch (error) {
      setFormError(error.message);
    }
  }

  function handleBorrow(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      library.borrowBook(form.get("memberId"), selectedBook.id, form.get("dueDate"));
      refresh();
      closeModal();
      setNotice(`"${selectedBook.title}" has been checked out.`);
    } catch (error) {
      setFormError(error.message);
    }
  }

  function handleReturn(transaction) {
    try {
      library.returnBook(transaction.id);
      refresh();
      setNotice(`"${transaction.book.title}" has been returned.`);
    } catch (error) {
      setNotice(error.message);
    }
  }

  function checkOverdue() {
    try {
      library.checkOverdueTransactions(new Date());
      refresh();
      setNotice("Overdue loans checked. Borrowers have been notified.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  const navItems = [
    { name: "Overview", icon: "grid" },
    { name: "Books", icon: "book", count: books.length },
    { name: "Members", icon: "users", count: users.length },
    { name: "Borrowing", icon: "loan", count: activeTransactions.length },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => setPage("Overview")}>
          <span className="brand-mark"><Icon name="book" size={21} /></span>
          <span>folio<span className="brand-period">.</span></span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <div className="library-switcher">
          <span className="switcher-mark">R</span>
          <span className="switcher-copy"><strong>Riverside Library</strong><small>Community branch</small></span>
          <span className="switcher-chevron">⌄</span>
        </div>

        <div className="nav-heading">MENU</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              className={`nav-link ${page === item.name ? "active" : ""}`}
              key={item.name}
              onClick={() => { setPage(item.name); setQuery(""); }}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.name}</span>
              {item.count !== undefined && <span className="nav-count">{item.count}</span>}
            </button>
          ))}
          <button
            className={`nav-link ${page === "Overdue" ? "active" : ""}`}
            onClick={() => { setPage("Overdue"); setQuery(""); }}
          >
            <Icon name="clock" size={18} />
            <span>Overdue</span>
            {overdueTransactions.length > 0 && <span className="nav-count alert-count">{overdueTransactions.length}</span>}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon"><Icon name="spark" size={17} /></span>
            <strong>A little reading goes a long way.</strong>
            <span>Your library, thoughtfully organized.</span>
          </div>
          <button className="profile-button" onClick={() => setPage("Members")}>
            <span className="avatar avatar-plum">{initials(currentUser?.name || "Library")}</span>
            <span className="profile-copy"><strong>{currentUser?.name || "Library Admin"}</strong><small>Library admin</small></span>
            <span className="profile-dots">···</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Library</span><span className="crumb-slash">/</span><strong>{page}</strong></div>
          <div className="topbar-actions">
            <label className="search-box">
              <Icon name="search" size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search anything..."
                aria-label="Search books or members"
              />
              <kbd>⌘ K</kbd>
            </label>
            <span className="today-label">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
        </header>

        <div className="page-content">
          {notice && (
            <div className="notice" role="status">
              <Icon name="check" size={17} /><span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss notification"><Icon name="close" size={16} /></button>
            </div>
          )}

          {page === "Overview" && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="eyebrow-dot" /> YOUR LIBRARY AT A GLANCE</div>
                  <h1>A good day to read, <span>{greetingName}.</span></h1>
                  <p className="page-subtitle">Here&apos;s what&apos;s happening around your library today.</p>
                </div>
                <button className="button button-dark" onClick={() => showModal("book")}><Icon name="plus" size={17} /> Add a book</button>
              </section>

              <section className="stats-grid" aria-label="Library statistics">
                <StatCard label="Total collection" value={books.length} note={`${availableBooks.length} available to borrow`} icon="book" tone="sage" />
                <StatCard label="Active checkouts" value={activeTransactions.length} note="Books currently with readers" icon="loan" tone="lavender" />
                <StatCard label="Registered members" value={users.length} note="Students and teachers" icon="users" tone="peach" />
                <StatCard label="Needs attention" value={overdueTransactions.length} note={overdueTransactions.length ? "Past their return date" : "You're all caught up"} icon="clock" tone="pink" />
              </section>

              <section className="content-grid">
                <div className="panel collection-panel">
                  <div className="panel-heading">
                    <div><h2>Recently added</h2><p>A few fresh arrivals on your shelves</p></div>
                    <button className="text-button" onClick={() => setPage("Books")}>View catalog <Icon name="arrow" size={15} /></button>
                  </div>
                  <BookGrid
                    books={books.slice(-4).reverse()}
                    onBorrow={(book) => showModal("borrow", book)}
                    emptyText="Add your first book to start building the collection."
                  />
                </div>
                <div className="panel activity-panel">
                  <div className="panel-heading">
                    <div><h2>Recent activity</h2><p>The latest from your library</p></div>
                    <span className="live-dot" title="Live updates" />
                  </div>
                  <ActivityList transactions={transactions.slice(-5).reverse()} />
                  {activeTransactions.length > 0 && <button className="activity-link" onClick={() => setPage("Borrowing")}>See all checkouts <Icon name="arrow" size={14} /></button>}
                </div>
              </section>

              <section className="bottom-banner">
                <div className="banner-art"><span>✳</span><span>✳</span><span>✳</span></div>
                <div><strong>Keep your shelves in the loop.</strong><p>Check due dates and send a friendly reminder to anyone with an overdue book.</p></div>
                <button className="button button-light" onClick={checkOverdue}>Check due dates <Icon name="arrow" size={15} /></button>
              </section>
            </>
          )}

          {page === "Books" && (
            <section>
              <PageHeading eyebrow="YOUR COLLECTION" title="The catalog" description={`${books.length} books on your shelves, ${availableBooks.length} ready to borrow.`}>
                <button className="button button-dark" onClick={() => showModal("book")}><Icon name="plus" size={17} /> Add a book</button>
              </PageHeading>
              <div className="catalog-toolbar"><span>{filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"}</span><span className="availability-key"><i /> Available <i className="key-unavailable" /> Checked out</span></div>
              <BookGrid books={filteredBooks} onBorrow={(book) => showModal("borrow", book)} emptyText={query ? "No books match your search." : "Your catalog is empty. Add a book to get started."} />
            </section>
          )}

          {page === "Members" && (
            <section>
              <PageHeading eyebrow="YOUR COMMUNITY" title="Library members" description="The readers who make this library a community.">
                <button className="button button-dark" onClick={() => showModal("member")}><Icon name="plus" size={17} /> Add a member</button>
              </PageHeading>
              <div className="panel table-panel">
                <div className="table-heading"><div><h2>All members</h2><p>{filteredUsers.length} registered readers</p></div></div>
                {filteredUsers.length ? (
                  <div className="table-scroll"><table><thead><tr><th>MEMBER</th><th>ROLE</th><th>EMAIL</th><th>BOOKS OUT</th></tr></thead>
                    <tbody>{filteredUsers.map((user, index) => {
                      const count = library.getBorrowedBooks(user.id).length;
                      return <tr key={user.id}><td><div className="member-cell"><span className={`avatar avatar-${index % 4}`}>{initials(user.name)}</span><strong>{user.name}</strong></div></td><td><span className={`role-pill ${user.role.toLowerCase()}`}>{user.role}</span></td><td className="muted-cell">{user.email}</td><td><span className="checkout-count">{count}</span></td></tr>;
                    })}</tbody></table></div>
                ) : <EmptyState title="No members found" detail={query ? "Try a different search." : "Add your first member to get started."} />}
              </div>
            </section>
          )}

          {(page === "Borrowing" || page === "Overdue") && (
            <section>
              <PageHeading
                eyebrow={page === "Overdue" ? "DUE DATE TRACKER" : "CIRCULATION"}
                title={page === "Overdue" ? "A gentle nudge" : "Borrowing activity"}
                description={page === "Overdue" ? "These books are past their return date." : "Keep track of every book out in the community."}
              >
                <button className="button button-outline" onClick={checkOverdue}><Icon name="clock" size={16} /> Check due dates</button>
              </PageHeading>
              <div className="panel table-panel">
                <div className="table-heading"><div><h2>{page === "Overdue" ? "Overdue books" : "Loan history"}</h2><p>{visibleLoans.length} {visibleLoans.length === 1 ? "record" : "records"}</p></div></div>
                {visibleLoans.length ? (
                  <div className="table-scroll"><table><thead><tr><th>BOOK</th><th>MEMBER</th><th>CHECKED OUT</th><th>DUE DATE</th><th>STATUS</th><th></th></tr></thead>
                    <tbody>{visibleLoans.slice().reverse().map((transaction) => <tr key={transaction.id}>
                      <td><div className="table-book"><span className="mini-cover cover-sage"><Icon name="book" size={15} /></span><strong>{transaction.book.title}</strong></div></td>
                      <td className="member-name-cell">{transaction.borrower.name}</td>
                      <td className="muted-cell">{formatDate(transaction.borrowedOn)}</td>
                      <td className="muted-cell">{formatDate(transaction.dueDate)}</td>
                      <td><span className={`status-pill ${transaction.overdue ? "status-overdue" : "status-active"}`}><i />{transaction.overdue ? "Overdue" : "On loan"}</span></td>
                      <td><button className="return-button" onClick={() => handleReturn(transaction)}>Return</button></td>
                    </tr>)}</tbody></table></div>
                ) : <EmptyState title={page === "Overdue" ? "Nothing overdue" : "No books checked out"} detail={page === "Overdue" ? "All your readers are right on time. Lovely." : "Your loan activity will show up here."} />}
              </div>
            </section>
          )}
        </div>
        <footer className="footer"><span>Made for the love of reading.</span><span>Folio Library Manager <i>·</i> {new Date().getFullYear()}</span></footer>
      </main>

      {modal && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-top">
              <span className="modal-icon"><Icon name={modal === "book" ? "book" : modal === "member" ? "users" : "loan"} size={19} /></span>
              <button className="icon-button" onClick={closeModal} aria-label="Close dialog"><Icon name="close" size={18} /></button>
            </div>
            <div className="modal-heading">
              <h2 id="modal-title">{modal === "book" ? "Add to the shelves" : modal === "member" ? "Welcome a reader" : "Check out this book"}</h2>
              <p>{modal === "book" ? "A new story, reference, or favorite for your collection." : modal === "member" ? "Add someone new to your library community." : `Choose a member and a due date for “${selectedBook?.title}”.`}</p>
            </div>
            {formError && <div className="form-error" role="alert">{formError}</div>}
            {modal === "book" && <form onSubmit={handleAddBook}>
              <FormField label="Book title"><input name="title" placeholder="e.g. The Midnight Library" required autoFocus /></FormField>
              <FormField label="Author"><input name="author" placeholder="e.g. Matt Haig" required /></FormField>
              <FormField label="Category"><input name="category" placeholder="e.g. Fiction" /></FormField>
              <FormActions onCancel={closeModal} submit="Add book" />
            </form>}
            {modal === "member" && <form onSubmit={handleAddMember}>
              <FormField label="Full name"><input name="name" placeholder="e.g. Alex Morgan" required autoFocus /></FormField>
              <FormField label="Email address"><input name="email" type="email" placeholder="alex@example.com" required /></FormField>
              <FormField label="Member type"><select name="role" defaultValue="student"><option value="student">Student</option><option value="teacher">Teacher</option></select></FormField>
              <FormActions onCancel={closeModal} submit="Add member" />
            </form>}
            {modal === "borrow" && <form onSubmit={handleBorrow}>
              <FormField label="Borrower"><select name="memberId" required defaultValue=""><option value="" disabled>Select a member</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.role}</option>)}</select></FormField>
              <FormField label="Due date"><input name="dueDate" type="date" min={dateOffset(1)} defaultValue={dateOffset(14)} required /></FormField>
              <FormActions onCancel={closeModal} submit="Confirm checkout" disabled={!users.length} />
            </form>}
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, note, icon, tone }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon} size={18} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></article>;
}

function PageHeading({ eyebrow, title, description, children }) {
  return <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> {eyebrow}</div><h1>{title}</h1><p className="page-subtitle">{description}</p></div>{children}</div>;
}

function BookGrid({ books, onBorrow, emptyText }) {
  if (!books.length) return <EmptyState title="No books to show" detail={emptyText} />;
  return <div className="book-grid">{books.map((book, index) => <article className="book-card" key={book.id}>
    <div className={`book-cover cover-${index % 5}`}>
      <span className="cover-kicker">{book.category || "FROM THE LIBRARY"}</span>
      <Icon name="book" size={25} />
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author}</span>
      <span className="cover-decoration" />
    </div>
    <div className="book-card-info"><div className="book-card-copy"><strong title={book.title}>{book.title}</strong><span>{book.author}</span></div>
      {book.available ? <button className="borrow-button" onClick={() => onBorrow(book)}>Lend <Icon name="arrow" size={13} /></button> : <span className="unavailable-label">On loan</span>}
    </div>
  </article>)}</div>;
}

function ActivityList({ transactions }) {
  if (!transactions.length) return <EmptyState title="A fresh start" detail="Checkouts and returns will appear here." compact />;
  return <div className="activity-list">{transactions.map((transaction) => <div className="activity-item" key={transaction.id}>
    <span className={`activity-avatar ${transaction.returned ? "activity-returned" : ""}`}><Icon name={transaction.returned ? "check" : "book"} size={15} /></span>
    <span className="activity-copy"><strong>{transaction.borrower.name}</strong><span>{transaction.returned ? "returned" : "borrowed"} <b>{transaction.book.title}</b></span></span>
    <span className="activity-date">{transaction.returned ? formatDate(transaction.returnedOn) : formatDate(transaction.borrowedOn)}</span>
  </div>)}</div>;
}

function EmptyState({ title, detail, compact = false }) {
  return <div className={`empty-state ${compact ? "compact" : ""}`}><span className="empty-icon"><Icon name="book" size={20} /></span><strong>{title}</strong><span>{detail}</span></div>;
}

function FormField({ label, children }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}

function FormActions({ onCancel, submit, disabled = false }) {
  return <div className="form-actions"><button type="button" className="button button-outline" onClick={onCancel}>Cancel</button><button type="submit" className="button button-dark" disabled={disabled}>{submit}<Icon name="arrow" size={15} /></button></div>;
}
