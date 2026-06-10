# Setup Guide — Connecting the Project to a New Database

Follow this guide when you are ready to switch this project from the original database to your own Firebase and Cloudinary accounts.

---

## Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `my-portfolio`)
3. Click through and create the project

### Enable Firestore
- In the left menu: **Build → Firestore Database → Create database**
- Choose **Production mode**
- Pick a region close to you → Done

### Enable Authentication
- In the left menu: **Build → Authentication → Get started**
- Go to the **Sign-in method** tab → enable **Email/Password**
- Go to the **Users** tab → click **Add user** → enter your admin email and password

### Set Firestore Security Rules
- In Firestore: click the **Rules** tab
- Replace the default rules with this and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

This lets the portfolio read data publicly, but only your logged-in admin can write.

### Get Your Firebase Config
- Click the **gear icon (Project Settings) → General**
- Scroll to **Your apps** → click **Add app → Web app (< />)**
- Register the app (any nickname)
- You will see a `firebaseConfig` object like this — **copy all the values**:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## Step 2 — Create a Cloudinary Account

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier is enough)
2. After login, your **Cloud Name** is shown at the top of the dashboard — note it down

### Create an Unsigned Upload Preset
- Go to **Settings (gear icon) → Upload**
- Scroll to **Upload presets** → click **Add upload preset**
- Set **Signing mode: Unsigned**
- Give it a name (e.g. `portfolio_unsigned`) — note this name down
- Click **Save**

---

## Step 3 — Update the Project Files

With your Firebase config and Cloudinary values ready, update these 6 files:

---

### Firebase — 2 files

**File 1:** `hasindu_admin/js/firebase-config.js`

```js
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
```

**File 2:** `app/lib/firebase.ts` (the portfolio Next.js app)

Same replacement — paste the same `firebaseConfig` values here.

---

### Cloudinary — 4 files

In each file below, find `CLOUD_NAME` and `UPLOAD_PRESET` and replace the values:

| File | Where to look |
|------|--------------|
| `hasindu_admin/js/cloudinary.js` | Lines 1–2 (top of file) |
| `hasindu_admin/js/projects.js` | Inside `DOMContentLoaded`, near the top |
| `hasindu_admin/js/stack_management.js` | Lines near the top, under `/* Cloudinary */` comment |
| `hasindu_admin/pages/edit_stack.html` | Inside the `<script>` block at the bottom |

Change these two lines in each file:
```js
const CLOUD_NAME = "your_cloud_name_here";
const UPLOAD_PRESET = "your_upload_preset_name_here";
```

---

## Step 4 — Verify Everything Works

1. Open the admin panel → log in with the email/password you added in Firebase Auth → should succeed
2. Add a test skill (Stack Management) with an icon image → the icon should appear in your Cloudinary media library
3. Add a test project → check it appears in your Firestore `projects` collection
4. Open the portfolio site → projects and skills sections should load from your new Firestore
5. Delete the test entries from the admin panel when done

---

## Firestore Collections Reference

The admin panel creates these collections automatically when you add data. You do not need to create them manually — just start adding content through the admin panel.

| Collection | What it stores |
|------------|---------------|
| `projects` | Portfolio projects (name, description, links, images, videos) |
| `category` | Project categories (e.g. Web, Mobile) |
| `status` | Live view status labels (e.g. Live, In Progress) |
| `stacks` | Skills/tech stack (name, percentage, icon) |
| `experience` | Years of experience and total project count (single doc, ID: `data`) |
| `cv` | Google Drive CV link (single doc, ID: `main`) |

> **Tip:** The `status` collection needs at least a couple of documents before you can add projects. Add them first via Firestore console or by using the admin panel once it's connected.
