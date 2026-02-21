import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, initError } from "./firebase/config";

import { CodePanel } from "./components/CodePanel";
import { AuthPanel } from "./components/AuthPanel";
import { MessagesPanel } from "./components/MessagesPanel";
import { Toast } from "./components/Toast";
import { SetupBanner } from "./components/SetupBanner";

import { SNIPPETS } from "./utility/snippets";
import { TABS } from "./utility/tabs";
import { s } from "./utility/styles";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "spojen";

export default function App() {
  const [tab, setTab] = useState("pregled");
  const [user, setUser] = useState(null);
  const [snippet, setSnippet] = useState(SNIPPETS.init);
  const [toast, setToast] = useState(null);
  const [snapshotEvents, setSnapshotEvents] = useState(0);

  useEffect(() => {
    if (auth) return onAuthStateChanged(auth, setUser);
  }, []);

  const dismissToast = () => setToast(null);

  const renderDemo = () => {
    switch (tab) {
      case "pregled":
        return (
          <div style={s.diagram}>
            <div style={s.box}>
              <div style={s.boxTitle}>Klijent (Browser)</div>
              <div style={s.boxDesc}>HTML, CSS, JS na računalu korisnika</div>
            </div>
            <div style={s.arrow}>↔</div>
            <div style={{ ...s.box, borderColor: "var(--accent)" }}>
              <div style={s.boxTitle}>Firebase (Cloud)</div>
              <div style={s.boxDesc}>
                Auth, Firestore, Hosting na Google serverima
              </div>
            </div>
          </div>
        );
      case "init":
        return (
          <div style={s.card}>
            <p>
              Konfiguracija se čita iz varijabli okruženja (<code>.env</code>).
            </p>
            <p>
              Nakon <code>initializeApp()</code> aplikacija je spojena s
              Firebaseom.
            </p>
            <p
              style={{
                marginTop: 16,
                fontSize: 14,
                color: "var(--text-muted)",
              }}
            >
              Projekt ID: {db ? projectId : "—"}
            </p>
          </div>
        );
      case "auth":
        return (
          <AuthPanel
            auth={auth}
            onAuthChange={{ user }}
            onRegister={() => setSnippet(SNIPPETS.register)}
            onLogin={() => setSnippet(SNIPPETS.login)}
            onLogout={() => setSnippet(SNIPPETS.signOut)}
          />
        );
      case "crud":
        return (
          <MessagesPanel
            db={db}
            auth={auth}
            mode="crud"
            onAdd={() => setSnippet(SNIPPETS.addDoc)}
            onLoad={() => setSnippet(SNIPPETS.getDocs)}
            onUpdate={() => setSnippet(SNIPPETS.updateDoc)}
            onDelete={() => setSnippet(SNIPPETS.deleteDoc)}
          />
        );
      case "realtime":
        return (
          <div>
            <MessagesPanel
              db={db}
              auth={auth}
              mode="realtime"
              onSnapshotEvent={() => setSnapshotEvents((n) => n + 1)}
            />
            <div style={s.eventLog}>onSnapshot poziva: {snapshotEvents}</div>
          </div>
        );
      case "security":
        return (
          <div style={s.card}>
            <p>
              Pravila se postavljaju u Firebase konzoli → Firestore → Rules.
            </p>
            <button
              style={s.toggleBtn}
              onClick={() => setSnippet(SNIPPETS.rulesInsecure)}
            >
              Nesigurno (test mod)
            </button>
            <button
              style={s.toggleBtn}
              onClick={() => setSnippet(SNIPPETS.rulesSecure)}
            >
              Sigurno (samo prijavljeni)
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const getSnippet = () => {
    switch (tab) {
      case "pregled":
      case "init":
        return SNIPPETS.init;
      case "auth":
      case "crud":
      case "security":
        return snippet;
      case "realtime":
        return SNIPPETS.onSnapshot;
      default:
        return SNIPPETS.init;
    }
  };

  useEffect(() => {
    if (tab === "auth") setSnippet(SNIPPETS.login);
    if (tab === "crud") setSnippet(SNIPPETS.addDoc);
    if (tab === "security") setSnippet(SNIPPETS.rulesSecure);
  }, [tab]);

  const statusFirebase = initError
    ? "Greška"
    : auth && db
      ? "Spojen"
      : "Nije inicijaliziran";

  return (
    <div style={s.app}>
      {initError && (
        <div style={s.bannerWrap}>
          <SetupBanner message={initError} compact />
        </div>
      )}

      <nav style={s.nav}>
        {TABS.map((t) => (
          <button
            key={t.id}
            style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div style={s.main}>
        <div style={s.left}>{renderDemo()}</div>
        <div style={s.right}>
          <CodePanel code={getSnippet()} filename="app.js" />
        </div>
      </div>

      <footer style={s.statusBar}>
        <span>Auth: {user ? user.email : "Neprijavljen"}</span>
        <span
          style={{ color: statusFirebase === "Greška" ? "#e06c75" : undefined }}
        >
          Firebase: {statusFirebase}
        </span>
      </footer>

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={dismissToast} />
      )}
    </div>
  );
}
