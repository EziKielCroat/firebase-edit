# Firebase Demo – Napredni JS tečaj

Interaktivna React 18 demo aplikacija za prezentaciju Firebase (Auth, Firestore).

## Postavljanje

1. Instaliraj ovisnosti:

```bash
npm install
```

2. Kreiraj Firebase projekt u [Firebase konzol](https://console.firebase.google.com).

3. Uključi **Authentication** (Email/Password) i **Firestore Database**.

4. Kopiraj `.env.example` u `.env` i popuni vrijednosti:

```bash
cp .env.example .env
```

5. U Firebase konzoli uzmi vrijednosti:
   - Projekt Settings → Opće → Tvoja aplikacija → Config

6. Pokreni dev server:

```bash
npm run dev
```

## Troubleshooting

**auth/configuration-not-found:**  
Uključi Authentication u Firebase konzoli: **Authentication → Get started → Email/Password → Enable**

**Firestore index required:**  
Kad koristiš `orderBy`, Firestore može zatražiti indeks. Klikni na link u grešci da ga automatski kreiraš.

## Firestore pravila

Postavi pravila za kolekciju `poruke` (Firestore → Rules):

```
allow read, write: if request.auth != null;
```

**Važno:** Za CRUD i Real-time tabove **moraš biti prijavljen**. Prijavi se na tabu Autentifikacija prije nego otvoriš CRUD ili Real-time.

## Struktura

- `src/firebase/config.js` – Firebase inicijalizacija
- `src/components/` – Auth, Messages, CodePanel
- `src/App.jsx` – Glavna aplikacija s tabovima
