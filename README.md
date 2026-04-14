# 📊 HisaabKitaab

> Automatic expense tracker using SMS + AI (India-focused)

---

## 🚀 Overview

HisaabKitaab is a mobile-first app that automatically tracks expenses by reading bank SMS (UPI, debit, credit) and converting them into structured transactions.

---

## ✨ Features

* 📩 Auto expense tracking from SMS
* 🧠 Regex + AI-based parsing
* 🏷️ Auto categorization
* 📊 Transaction dashboard
* 🔁 Deduplication

---

## 🏗️ Tech Stack

* **Backend:** NestJS, PostgreSQL, Prisma, BullMQ
* **Mobile:** React Native
* **AI:** OpenAI

---

## ⚠️ Note

* Works **only on Android** (SMS access required)
* SMS reading does **not work in Expo Go**

---

## 🧪 Status

🚧 Early MVP

* Parsing works (dummy data)
* Real SMS integration in progress

---

## 🛠️ Setup

### Backend

```bash
cd hisaab-kitaab-backend
npm install
npm run start:dev
```

### Mobile

```bash
cd hisaab-kitaab-mobile
npm install
npx expo start
```

---

## 🚀 Roadmap

* SMS real-time sync
* Budget alerts
* AI insights
* Authentication

---

## 👨‍💻 Author

Ayman Velani
