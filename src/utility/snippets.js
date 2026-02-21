export const SNIPPETS = {
    init: `import { initializeApp } from 'firebase/app'
  import { getAuth } from 'firebase/auth'
  import { getFirestore } from 'firebase/firestore'
  
  const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "moj-projekt.firebaseapp.com",
    projectId: "moj-projekt",
    storageBucket: "moj-projekt.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc"
  }
  
  const app = initializeApp(firebaseConfig)
  export const auth = getAuth(app)
  export const db = getFirestore(app)`,
  
    register: `import { createUserWithEmailAndPassword } from 'firebase/auth'
  
  btnRegistracija.addEventListener("click", async () => {
    const email = inputRegEmail.value
    const lozinka = inputRegLozinka.value
    try {
      await createUserWithEmailAndPassword(auth, email, lozinka)
      alert("Račun uspješno kreiran!")
    } catch (error) {
      alert("Greška: " + error.message)
    }
  })`,
  
    login: `import { signInWithEmailAndPassword } from 'firebase/auth'
  
  btnPrijava.addEventListener("click", async () => {
    const email = inputEmail.value
    const lozinka = inputLozinka.value
    try {
      await signInWithEmailAndPassword(auth, email, lozinka)
      divStatus.innerHTML = "<p>Uspješna prijava!</p>"
    } catch (error) {
      divStatus.innerHTML = "<p>Greška: Krivi podaci.</p>"
    }
  })`,
  
    authState: `import { onAuthStateChanged } from 'firebase/auth'
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginSekcija.style.display = "none"
      divStatus.innerHTML = \`Pozdrav, \${user.email}\`
    } else {
      loginSekcija.style.display = "block"
      divStatus.innerHTML = ""
    }
  })`,
  
    signOut: `import { signOut } from 'firebase/auth'
  
  btnLogout.addEventListener("click", async () => {
    try {
      await signOut(auth)
      alert("Uspješno ste odjavljeni.")
    } catch (error) {
      alert("Greška pri odjavi.")
    }
  })`,
  
    addDoc: `import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
  
  btnPosalji.addEventListener("click", async () => {
    const tekst = inputPoruka.value
    const kolekcijaPoruka = collection(db, "poruke")
    await addDoc(kolekcijaPoruka, {
      tekst: tekst,
      autorEmail: auth.currentUser?.email,
      vrijeme: serverTimestamp()
    })
    inputPoruka.value = ""
  })`,
  
    getDocs: `import { getDocs } from 'firebase/firestore'
  
  async function ucitajPoruke() {
    const kolekcijaPoruka = collection(db, "poruke")
    const rezultati = await getDocs(kolekcijaPoruka)
    ispisDiv.innerHTML = ""
    rezultati.forEach((dokument) => {
      const podaci = dokument.data()
      const p = document.createElement("p")
      p.innerText = podaci.tekst
      ispisDiv.appendChild(p)
    })
  }
  ucitajPoruke()`,
  
    updateDoc: `import { doc, updateDoc } from 'firebase/firestore'
  
  const dokumentRef = doc(db, "poruke", idDokumenta)
  await updateDoc(dokumentRef, {
    tekst: "Ovo je izmijenjena poruka"
  })`,
  
    deleteDoc: `import { doc, deleteDoc } from 'firebase/firestore'
  
  const dokumentRef = doc(db, "poruke", idDokumenta)
  await deleteDoc(dokumentRef)`,
  
    onSnapshot: `import { onSnapshot, query, orderBy } from 'firebase/firestore'
  
  const q = query(
    collection(db, "poruke"),
    orderBy("vrijeme", "asc")
  )
  onSnapshot(q, (snapshot) => {
    ispisDiv.innerHTML = ""
    snapshot.forEach((doc) => {
      const podaci = doc.data()
      ispisDiv.innerHTML += \`<p>\${podaci.autorEmail}: \${podaci.tekst}</p>\`
    })
  })`,
  
    rulesInsecure: `rules_version = '2'
  service cloud.firestore {
    match /databases/{database}/documents {
      match /poruke/{document=**} {
        allow read, write: if true
      }
    }
  }`,
  
    rulesSecure: `rules_version = '2'
  service cloud.firestore {
    match /databases/{database}/documents {
      match /poruke/{document=**} {
        allow read, write: if request.auth != null
      }
    }
  }`,
  }