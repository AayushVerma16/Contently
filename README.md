# 📝 CONTENTLY — Your Creative Content Platform

**CONTENTLY** is a modern content creation and sharing platform where users can create posts, share their thoughts, engage with followers, and manage their creative dashboard — all in one seamless experience.

Built using **Next.js App Router**, CONTENTLY emphasizes performance, intuitive design, and a smooth content creation workflow.

🌐 **Live Website:** [https://getcontently.vercel.app/]

---

## 🖼️ Platform Preview

<img width="1919" height="936" alt="Screenshot 2025-12-17 133250" src="https://github.com/user-attachments/assets/7c395ba5-e504-41e6-a955-c2798c87081f" />

---

## 🚀 Features

### 📱 Dashboard
- Personalized content dashboard
- Real-time analytics and insights
- Track your content performance

### ✍️ Create Content
- Rich post editor with advanced formatting
- Image upload and management
- Draft and publish workflow

### 👥 Social Features
- Follow and connect with creators
- Engage with posts through likes and comments
- Build your audience

### 📊 Feed & Discovery
- Explore trending content
- Personalized content recommendations
- Filter and search capabilities

### 🎨 Rich Content Editor
- Advanced post editing tools
- Image integration via ImageKit
- Customizable post settings

### 🔐 Authentication
- Secure authentication flow
- User profiles and settings
- Route-based auth using App Router groups

### ⚡ Real-time Updates
- Live comments and interactions
- Real-time notifications
- Instant content updates

---

## 🧱 Tech Stack

- ⚛️ **Next.js 14+ (App Router)**
- 🎨 **Tailwind CSS**
- 🧩 **TypeScript**
- 🧠 **Convex** (Backend & real-time database)
- 🖼️ **ImageKit** (Image management & optimization)
- 🎭 **Gemini AI** (AI-powered features)
- 🚀 **Vercel** (Deployment)

---

## 📁 Project Structure

```text
app/
├── (auth)/
│   ├── sign-in/
│   ├── sign-up/
│   └── layout.tsx
│
├── (public)/
│   ├── [username]/
│   └── feed/
│
├── actions/
│   └── gemini.ts
│
├── api/
│   └── imagekit/
│       └── upload/
│
├── dashboard/
│   ├── create/
│   ├── followers/
│   ├── posts/
│   ├── settings/
│   ├── layout.tsx
│   └── page.tsx
│
├── layout.tsx
├── page.tsx
├── globals.css
├── ConvexClientProvider.tsx
└── favicon.ico

components/
├── ui/
│   └── [shadcn components]
├── daily-views-chart.tsx
├── header.tsx
├── image-upload-dialog.tsx
├── post-card.tsx
├── post-editor-content.tsx
├── post-editor-header.tsx
├── post-editor-settings.tsx
├── post-editor.tsx
└── theme-provider.tsx

convex/
├── _generated/
├── auth.config.ts
├── comments.ts
├── dashboard.ts
├── feed.ts
├── follows.ts
├── likes.ts
├── posts.ts
├── public.ts
├── schema.ts
└── users.ts

hooks/
lib/
node_modules/
public/
```

---

## ⚙️ Getting Started

Follow the steps below to run **CONTENTLY** locally on your machine.

---

### 📦 Prerequisites

Make sure you have the following installed:
- Node.js (v18 or later)
- npm
- Git

---

### 📥 Clone the Repository

```bash
git clone https://github.com/your-username/contently.git
cd contently
```

---

### 📚 Install Dependencies

Using npm:
```bash
npm install
```
---

### 🔐 Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
CONVEX_DEPLOYMENT=
CONVEX_DEPLOY_KEY=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_JWT_ISSUER_DOMAIN=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
GEMINI_API_KEY=
```

Make sure your Convex backend is properly set up before running the app.

---

### ▶️ Run the Development Server

First, start the Convex backend:
```bash
npx convex dev
```

Then, in a new terminal, start the Next.js dev server:
```bash
npm run dev
```

Open your browser and visit:
```
http://localhost:3000
```

---

### 🛠️ Build for Production

```bash
npm run build
npm start
```

---

## 🎉 You're All Set!

Start creating, sharing, and engaging with **CONTENTLY**! 🚀

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/pulkit1417/contently/issues).

---

## 💬 Contact

For questions or feedback, reach out at: **gupta.pulkit2408@example.com**

---

**Made with ❤️ for content creators and storytellers**
