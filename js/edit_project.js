import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { uploadToCloudinary } from "./cloudinary.js";

document.addEventListener("DOMContentLoaded", async () => {

  // ===============================
  // GET PROJECT ID
  // ===============================
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");

  if (!projectId) {
    alert("Invalid project");
    location.href = "projects.html";
    return;
  }

  // ===============================
  // FORM ELEMENTS (🔥 THIS WAS MISSING)
  // ===============================
  const form = document.getElementById("editProjectForm");

  const name = document.getElementById("name");
  const git_link = document.getElementById("git_link");
  const description = document.getElementById("description");
  const categorySelect = document.getElementById("categorySelect");
  const statusSelect = document.getElementById("statusSelect");
  const live_link = document.getElementById("live_link");

  const img = document.getElementById("img");
  const video = document.getElementById("video");
  const usecase_pdf = document.getElementById("usecase_pdf");

  const mediaPreview = document.getElementById("mediaPreview");

  // ===============================
  // LOAD CATEGORY & STATUS
  // ===============================
  async function loadSelects() {
    const catSnap = await getDocs(collection(db, "category"));
    categorySelect.innerHTML = `<option value="">Select Category</option>`;
    catSnap.forEach(d => {
      categorySelect.innerHTML += `<option value="${d.id}">${d.data().name}</option>`;
    });

    const statSnap = await getDocs(collection(db, "status"));
    statusSelect.innerHTML = `<option value="">Select Status</option>`;
    statSnap.forEach(d => {
      statusSelect.innerHTML += `<option value="${d.id}">${d.data().label}</option>`;
    });
  }

  // ===============================
  // LOAD PROJECT DATA
  // ===============================
  async function loadProject() {
    const ref = doc(db, "projects", projectId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Project not found");
      return;
    }

    const p = snap.data();

    name.value = p.name || "";
    git_link.value = p.git_link || "";
    description.value = p.description || "";
    categorySelect.value = p.category_id || "";
    statusSelect.value = p.view_live_id || "";
    live_link.value = p.live_link || "";

    mediaPreview.innerHTML = "";

    if (p.video) {
      mediaPreview.innerHTML += `
        <video src="${p.video}" width="320" controls style="border-radius:8px;"></video>
      `;
    } else if (p.img) {
      mediaPreview.innerHTML += `
        <img src="${p.img}" width="320" style="border-radius:8px;">
      `;
    }

    if (p.usecase_pdf) {
      mediaPreview.innerHTML += `
        <div class="mt-2">
          <a href="${p.usecase_pdf}" target="_blank" class="btn btn-warning btn-sm">
            View Current PDF
          </a>
        </div>
      `;
    }
  }

  // ===============================
  // UPDATE PROJECT
  // ===============================
  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ref = doc(db, "projects", projectId);
  const snap = await getDoc(ref);
  const old = snap.data();

  let imgURL = old.img || null;
  let videoURL = old.video || null;
  let pdfURL = old.usecase_pdf || null;

 if (img.files.length > 0) {
  const imgRes = await uploadToCloudinary(img.files[0], "projects/images");
  imgURL = imgRes.url;
  videoURL = null; // image replaces video
}

if (video.files.length > 0) {
  const videoRes = await uploadToCloudinary(video.files[0], "projects/videos");
  videoURL = videoRes.url;
  imgURL = null; // video replaces image
}


if (usecase_pdf.value.trim() !== "") {
  pdfURL = usecase_pdf.value.replace("/view", "/preview");
}



  // 🔥 Build clean object (NO undefined)
const updateData = {
  name: name.value,
  git_link: git_link.value,
  description: description.value,
  category_id: categorySelect.value,
  view_live_id: statusSelect.value,
  live_link: live_link.value || "",
  img: imgURL ?? null,
  video: videoURL ?? null,
  usecase_pdf: pdfURL ?? null
};


  await updateDoc(ref, updateData);

  alert("🔥 Project updated successfully");
  location.href = "projects.html";
});

  // ===============================
  // INIT (ORDER MATTERS!)
  // ===============================
  await loadSelects();
  await loadProject();

});
