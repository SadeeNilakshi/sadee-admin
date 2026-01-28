import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


const tableBody = document.getElementById("projectsTableBody");

// 🔥 GLOBAL MAPS (ONLY ONCE)
const categoryMap = {};
const statusMap = {};

// ===============================
// 🔥 LOAD CATEGORY MAP
// ===============================
async function loadCategoryMap() {
  const snap = await getDocs(collection(db, "category"));
  snap.forEach((doc) => {
    categoryMap[doc.id] = doc.data().name;
  });
}

// ===============================
// 🔥 LOAD STATUS MAP
// ===============================
async function loadStatusMap() {
  const snap = await getDocs(collection(db, "status"));
  snap.forEach((doc) => {
    statusMap[doc.id] = doc.data().label;
  });
}

// ===============================
// 🔥 LOAD PROJECTS
// ===============================
async function loadProjects() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-muted">Loading projects...</td>
    </tr>
  `;

  const querySnapshot = await getDocs(collection(db, "projects"));
  tableBody.innerHTML = "";

  if (querySnapshot.empty) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-muted">No projects found</td>
      </tr>
    `;
    return;
  }

  let index = 1;

  querySnapshot.forEach((doc) => {
    const p = doc.data();

    const categoryName = categoryMap[p.category_id] || "Unknown";
    const statusLabel = statusMap[p.view_live_id] || "Hidden";

    tableBody.innerHTML += `
      <tr>
        <td>${index++}</td>

        <td>
          ${
            p.video
              ? `<video src="${p.video}" width="90" muted autoplay loop style="border-radius:8px;"></video>`
              : `<img src="${p.img}" width="80" style="border-radius:8px;">`
          }
        </td>

        <td>${p.name}</td>
        <td>${categoryName}</td>

        <td>
          ${
            p.live_link
              ? `<a href="${p.live_link}" target="_blank" class="btn btn-success btn-sm">Live</a>`
              : `<span class="badge bg-secondary">${statusLabel}</span>`
          }
        </td>

        <td class="d-flex justify-content-center gap-2">
        <!-- Edit -->
        <button 
          class="btn btn-warning btn-sm edit-btn"
          data-id="${doc.id}"
          title="Edit"
        >
        <i class="bi bi-pencil-square"></i>
        </button>

        <!-- Delete -->
        <button 
          class="btn btn-danger btn-sm delete-btn"
          data-id="${doc.id}"
          title="Delete"
        >
        <i class="bi bi-trash"></i>
        </button>
      </td>


        <td>
          ${
            p.usecase_pdf
              ? `<a href="${p.usecase_pdf}" target="_blank" class="btn btn-warning btn-sm">View</a>`
              : `<span class="text-muted">—</span>`
          }
        </td>
      </tr>
    `;
  });
}

tableBody.addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest(".delete-btn");
  if (!deleteBtn) return;

  const projectId = deleteBtn.dataset.id;

  if (!projectId) {
    console.error("❌ Project ID missing");
    return;
  }

  const confirmed = confirm("⚠️ Are you sure you want to delete this project?");
  if (!confirmed) return;

  try {
    // Prevent double click
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = "Deleting...";

    await deleteDoc(doc(db, "projects", projectId));

    alert("🔥 Project deleted successfully");
    await loadProjects(); // refresh table

  } catch (err) {
    console.error("❌ Delete error:", err);
    alert("Failed to delete project");

    deleteBtn.disabled = false;
    deleteBtn.innerHTML = `<i class="bi bi-trash"></i>`;
  }
});

tableBody.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-btn");
  if (!editBtn) return;

  const projectId = editBtn.dataset.id;
  window.location.href = `edit_project.html?id=${projectId}`;
});

// ===============================
// 🔥 LOAD EVERYTHING IN ORDER
// ===============================
(async function init() {
  await loadCategoryMap();
  await loadStatusMap();
  await loadProjects();
})();
