import { db } from "./firebase-config.js";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* ---------------- CATEGORY ---------------- */

const table = document.getElementById("categoryTable");

window.addCategory = async () => {
  const id = catId.value.trim();
  const name = catName.value.trim();
  const order = Number(catOrder.value);

  if (!id || !name) return alert("Fill all fields");

  await setDoc(doc(db, "category", id), {
    name,
    order
  });

  catId.value = catName.value = catOrder.value = "";
  loadCategories();
};

async function loadCategories() {
  table.innerHTML = "";

  const q = query(collection(db, "category"), orderBy("order"));
  const snap = await getDocs(q);

  snap.forEach(docSnap => {
    const c = docSnap.data();

    table.innerHTML += `
      <tr>
        <td>${c.order}</td>
        <td>${c.name}</td>
        <td>
          <button class="btn btn-danger btn-sm"
            onclick="deleteCategory('${docSnap.id}')">🗑</button>
        </td>
      </tr>
    `;
  });
}

window.deleteCategory = async (id) => {
  if (!confirm("Delete category?")) return;
  await deleteDoc(doc(db, "category", id));
  loadCategories();
};

loadCategories();

/* ---------------- EXPERIENCE ---------------- */

const expRef = doc(db, "experience", "main");

async function loadExperience() {
  const snap = await getDoc(expRef);
  if (snap.exists()) {
    years.value = snap.data().years;
    projects.value = snap.data().projects;
  }
}

window.updateExperience = async () => {
await setDoc(expRef, {
  years: Number(years.value),
  projects: Number(projects.value)
}, { merge: true });

  alert("✅ Experience updated");
};

loadExperience();
