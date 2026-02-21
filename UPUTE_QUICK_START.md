# React + Vite + Firebase: Brzi vodič

Kratki upute kako pokrenuti React aplikaciju i spojiti je s Firebaseom. Za učenike i početnike.

---

## 1. Instalacija

Otvori terminal u mapi gdje želiš projekt (npr. Desktop ili Documents).

### 1.1 Kreiraj Vite React projekt

```bash
npm create vite@latest moj-projekt -- --template react
```

Unesi naziv projekta kad te pita (npr. `moj-projekt`). Template je `react`.

![Terminal – Vite create](https://raw.githubusercontent.com/EziKielCroat/firebase-edit/refs/heads/main/public/terminal-vite-create.png)

### 1.2 Uđi u projekt i instaliraj ovisnosti

```bash
cd moj-projekt
npm install
```

### 1.3 Instaliraj Firebase

```bash
npm install firebase
```

---

## 2. Kreiraj Firebase projekt

### 2.1 Otvori Firebase konzolu

Idi na [https://console.firebase.google.com](https://console.firebase.google.com) i prijavi se Google računom.

### 2.2 Novi projekt

1. Klikni **Create a new Firebase Project** ili Dodaj projekt
2. Unesi naziv (npr. `moj-chat`)
3. Možeš isključiti Google Analytics (nije potreban za početak)
4. Klikni **Create project**

![Kreiranje novog Firebase projekta](https://raw.githubusercontent.com/EziKielCroat/firebase-edit/refs/heads/main/public/creating%20a%20new%20project.png)

### 2.3 Uključi Authentication

1. U lijevom izborniku odaberi **Authentication**
2. Klikni **Get started**
3. Odaberi **Email/Password** i uključi ga (Enable)
   3.\* Možete također ovdje uključiti "Passwordless sign-in"
4. Spremi

![Authentication – Email/Password uključen](https://raw.githubusercontent.com/EziKielCroat/firebase-edit/refs/heads/main/public/authentication-email-password.png)

### 2.4 Kreiraj Firestore bazu

1. U lijevom izborniku odaberi **Firestore Database**
2. Klikni **Create database**
3. Odaberi **Standard Edition**
4. Odaberi regiju (npr. `eur3`)
5. Odaberi **Start in test mode** (za učenje; kasnije postavi auth pravila (jako bitno za sigurnost))
6. Klikni **Create**

![Firestore – Create database](https://raw.githubusercontent.com/EziKielCroat/firebase-edit/refs/heads/main/public/firestore-create-database.png)

### 2.5 Uzmi konfiguraciju

1. Klikni ikonu zupčanika pored **Project Overview** → **General**
2. Skrolaj do **Your apps**
3. Klikni ikonu web-a `</>` za "Web"
4. Unesi naziv appa (npr. `moj-chat-web`); registracija nije potrebna
5. Klikni **Register app**
6. Kopiraj objekt `firebaseConfig` – trebat će ti u sljedećem koraku

![Firebase config objekt u konzoli](https://raw.githubusercontent.com/EziKielCroat/firebase-edit/refs/heads/main/public/firebase-config.png)

---

## 3. Konfiguracija u projektu

### 3.1 Kreiraj .env datoteku

U rootu projekta (gdje je `package.json` ili `.env.example`) kreiraj datoteku `.env`.

U nju stavi (vrijednosti zamijeni svojim iz Firebase konzole):

```
VITE_FIREBASE_API_KEY=tvoj_api_key
VITE_FIREBASE_AUTH_DOMAIN=tvoj-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tvoj-projekt-id
VITE_FIREBASE_STORAGE_BUCKET=tvoj-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Važno:** Varijable moraju počinjati s `VITE_` da ih Vite učita.

### 3.2 Kreiraj Firebase config datoteku

U mapi `src` kreiraj `firebase` i unutra `config.js`:

```
src/
  firebase/
    config.js
```

Sadržaj `src/firebase/config.js`:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

![Struktura mapi i config.js u editoru](https://raw.githubusercontent.com/EziKielCroat/firebase-edit/refs/heads/main/public/primjer_koda.png)

---

## 4. Primjer: upis u bazu

Jednostavan primjer – gumb koji upisuje poruku u Firestore.

### 4.1 Komponenta s gumbom

U `App.jsx` (ili novoj komponenti):

```javascript
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase/config";

function App() {
  const [tekst, setTekst] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePosalji = async () => {
    if (!tekst.trim()) return;
    setLoading(true);
    try {
      const col = collection(db, "poruke");
      await addDoc(col, {
        tekst: tekst,
        vrijeme: serverTimestamp(),
      });
      setTekst("");
      alert("Poruka spremljena!");
    } catch (err) {
      alert("Greška: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <input
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder="Napiši poruku"
      />
      <button onClick={handlePosalji} disabled={loading}>
        {loading ? "Šaljem..." : "Pošalji"}
      </button>
    </div>
  );
}

export default App;
```

### 4.2 Što ovaj kod radi

1. `collection(db, 'poruke')` – referenca na kolekciju `poruke`
2. `addDoc(col, { ... })` – dodaje novi dokument
3. `serverTimestamp()` – vrijeme s servera (bolje od `new Date()` na klijentu, sigurnije)

### 4.3 Provjeri u Firestore konzoli

1. Otvori Firestore Database u Firebase konzoli
2. Trebala bi se pojaviti kolekcija `poruke` s dokumentima
3. Svaki dokument ima `tekst` i `vrijeme`

---

## 5. Pokretanje

```bash
npm run dev
```

Otvori URL u browseru (npr. `http://localhost:5173`). Ako je sve dobro postavljeno, unos i gumb rade bez grešaka.

---

## Brzi pregled

| Korak | Što                                                               |
| ----- | ----------------------------------------------------------------- |
| 1     | `npm create vite@latest` + `npm install` + `npm install firebase` |
| 2     | Firebase konzola: novi projekt, Auth (Email/Password), Firestore  |
| 3     | Uzmi config → `.env` (VITE\_ prefiks) → `src/firebase/config.js`  |
| 4     | `initializeApp`, `getAuth`, `getFirestore`                        |
| 5     | `addDoc(collection(db, 'ime'), { podaci })` za upis               |

---

## Česte greške

**"auth/configuration-not-found"**  
→ U Firebase konzoli uključi Authentication i Email/Password.

**"Missing or insufficient permissions"**  
→ Postavi Firestore pravila. Za test: `allow read, write: if true;` (samo za učenje).

**Varijable iz .env se ne vide**  
→ Mora biti prefiks `VITE_` i restart dev servera nakon promjene `.env`.

## Napomena

Naglasak, nemoj te se iznenaditi kad vidite da Firebase automatski vam nedaje dva korisnika s istim mailom, jer su određene funkcionalnosti ugrađene unutar usluga (kao to za authentikaciju).

Duje Žižić
