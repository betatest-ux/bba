# BBAlliance Website — Admin Guide

*A plain-English guide for trustees, staff and volunteers who look after the website.
No technical knowledge needed. Keep this somewhere handy.*

Everything on the website can be changed from the **admin panel** — the pages, the menus,
the colours, the photos, the forms. You should never need to call a developer to change
a piece of text.

---

## 🔑 Signing in

1. Go to **bballiance.org.uk/admin** (or `localhost:3000/admin` if you're trying the demo).
2. Enter your email and password.

The demo site comes with three accounts (password: `bballiance-demo`):

- **admin@bballiance.org.uk** — can do everything
- **editor@bballiance.org.uk** — can edit all content, but not settings or users
- **contributor@bballiance.org.uk** — can write drafts, but can't publish

> ⚠️ **Change these passwords immediately on the real site.** Click your initials
> (bottom-left) → your account → fill in "New password" → Save. Passwords must be at
> least 10 characters — a short phrase like `purple-tram-tuesday` works well.

If you type the wrong password five times, the account locks for 10 minutes. That's
deliberate — it keeps password-guessing robots out.

## 🏠 The dashboard

When you sign in you'll see cards showing:

- **📬 Inbox** — unread form messages and job applications, with CSV export links
- **📅 Upcoming events** and **⏳ vacancies closing this week**
- **✏️ Recent changes** — who edited what (admins only)
- **❤️ Site health** — reminders about placeholders and backups

Click anything to jump straight to it.

## ✏️ Editing a page

1. In the left menu, choose **Pages** and click the page you want.
2. Change what you need. The **Content** tab holds the page's building blocks.
3. Click **Save draft** to keep your work private, or **Publish changes** to make it live.
4. Use the **Preview** button (the eye) to see it exactly as visitors will — you can
   switch between phone, tablet and desktop views at the top.

Nothing goes live until you press Publish. Drafts are always safe to experiment with.

## 🧱 Reordering the homepage

The homepage is built from blocks you can shuffle like cards:

1. **Pages → Home → Content tab.**
2. Each block (stats row, featured projects, appeal, news, events…) has a **drag handle** —
   hold it and drag to reorder.
3. The **+** button adds a new block (pick from the list); the **⋮** menu on a block
   removes or duplicates it.
4. Publish when happy. Check it with Preview first.

## 🎨 Changing the accent colour & hero style

**Settings → Appearance** (admins only):

- **Accent colour** — Mill Brick, Loom Indigo or Moor Green. The options are limited on
  purpose: each one has been checked against accessibility contrast rules (WCAG AA), so
  whichever you pick, text stays readable for everyone, including in dark mode.
- **Hero style** — how the big homepage banner is laid out (Weave / Full photo / Split).
- **Offer dark mode** — lets visitors flip to a dark colour scheme.

> **Why can't I change the font or text size?** The type system is part of what keeps
> the site readable on every screen and is checked for accessibility. If something
> genuinely looks wrong, tell your developer rather than working around it — that's a
> design fix, not a settings fix.

## 🧭 Menus

- **Settings → Header Menu** — the main navigation. Drag items to reorder. Add
  **Dropdown links** under an item to make a dropdown. Tick **highlight** on one item
  (usually Donate) to style it as a stand-out button.
- **Settings → Footer Menu** — the link columns at the bottom, the small legal links,
  and the newsletter sign-up toggle.

Menu items can point at a page you pick from a list (updates itself if the page is
renamed) or any web address.

## ➕ Adding things (one recipe each)

**A project / activity** — Content → Projects → Create new. Fill in title, a one-line
summary (shows on cards), a cover photo, the full story, category (Youth, Food Support…)
and status. Publish. It appears at /activities automatically.

**A news article** — Content → News → Create new. Title, cover image, the story, a
category, and the author (from People). Publish — it appears at /news and in the RSS feed.

**An event** — Content → Events → Create new. Title, date & time, venue, description,
optional booking link. Publish. Visitors get an "Add to calendar" button automatically,
and past events move themselves to the archive.

**A vacancy** — Content → Vacancies → Create new. Role type (Paid/Voluntary), location,
hours, salary, **closing date** and description. Publish. The role disappears from the
public site by itself after the closing date — nothing to remember.

**An appeal** — Content → Appeals → Create new. Title, summary, story, target amount.
As donations come in, edit **Amount raised** — the progress bar updates everywhere,
including the homepage.

**Publishing later (scheduling)** — instead of Publish, use the arrow next to it and
choose **Schedule Publish**, then pick the date and time. Works for pages, news,
projects, events, appeals and vacancies.

## 📥 Managing job applications

**Inbox → Job Applications.** Each application shows the person's details, their cover
note and a **CV** you can open (CVs are private — only admins and editors can ever see
them). As you work through them, set the **Status**: New → Reviewed → Shortlisted →
Unsuccessful, and tick **Read**. The dashboard counts unread ones for you.

## 📣 The announcement bar

**Settings → Announcement Bar.** Tick "Show", write the message, optionally add a
button, and pick **Info** (calm blue) or **Urgent appeal** (red). You can set start and
end dates so it switches itself on and off — handy for appeal weeks or holiday closures.
Visitors can dismiss it; if you change the message, it reappears for everyone.

## 🔀 Redirects (when you rename a page)

If you rename or move a page, old links (from Google, Facebook, printed leaflets) would
break. Fix that in **Admin → Redirects**: put the old address in "From" (e.g.
`/old-page-name`) and pick the new page. Takes effect within a few minutes.

## 📝 Forms

- Build a new form in **Content → Forms** (add fields, mark them required, set the
  thank-you message and who gets emailed).
- Put it on any page by adding a **Form** block in that page's Content tab.
- Replies arrive in **Inbox → Form Submissions** *and* by email. Tick **Read** when
  handled. Export everything as CSV from the dashboard.

## 💌 Newsletter subscribers

Sign-ups from the footer land in **Inbox → Newsletter Subscribers**. "Confirmed" means
the person clicked the link in their confirmation email (that's the double-check the
law likes). Export the list as CSV from the dashboard — only import **confirmed**
addresses into your mailing tool. People unsubscribe themselves via the link in emails.

## 📄 The document library

**Content → Documents** is the public "Reports & documents" page — annual reports,
accounts, policies, minutes. Create new → upload the PDF → set the year and category.
Publishing these is part of being a transparent charity; funders look for them.

## 🖼️ Photos and the media library

- Every image **requires alt text** — a short description for people using screen
  readers. Write what's happening: *"Volunteers packing food parcels at Bangor Street"*,
  not *"photo1.jpg"*. The site won't let you skip it, on purpose.
- After uploading, drag the **focal point** dot to the most important part of the photo —
  that's the bit that stays visible when the image is cropped on phones.

## ⏪ Restoring an earlier version

Made a mess? Every save is kept.

1. Open the page/article → **Versions** tab.
2. Click a version to see it, then **Restore this version**.

That's it — the old version becomes the current one (and the mess is itself saved as a
version, so nothing is ever truly lost).

## 🚧 Maintenance mode

**Settings → Maintenance Mode** (admins only). Toggle it on and the public site shows a
branded "We'll be back soon" page with your message. The admin panel keeps working, and
you can still check pages via Preview. Toggle off to go live again.

## 👥 Who can do what

| Can they…                    | Admin | Editor | Contributor |
| ---------------------------- | :---: | :----: | :---------: |
| Write and edit drafts        |  ✅   |   ✅   |     ✅      |
| Publish / unpublish          |  ✅   |   ✅   |     ❌      |
| Delete content               |  ✅   |   ✅   |     ❌      |
| See the inbox & applications |  ✅   |   ✅   |     ❌      |
| Change menus & announcement  |  ✅   |   ✅   |     ❌      |
| Change settings & appearance |  ✅   |   ❌   |     ❌      |
| Manage users & custom code   |  ✅   |   ❌   |     ❌      |

Admins add new users in **Admin → Users** (set their name, email, role and a temporary
password — ask them to change it on first sign-in).

## 🆘 If something goes wrong

- **Deleted something?** Check its Versions tab — restore an earlier version.
- **Site looks broken after a settings change?** Change the setting back; if unsure,
  note what you changed and tell your developer.
- **Seeing `[PLACEHOLDER — replace]` anywhere?** That's demo text from the initial
  setup — replace it with the real fact whenever you spot one.
- Anything else: your developer, with a screenshot and the address of the page.
