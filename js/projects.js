import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("🔥 projects.js loaded");
const categoryMap = {};
const statusMap = {};

document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("categorySelect");
  const statusSelect = document.getElementById("statusSelect");

  const form = document.getElementById("addProjectForm");

  if (!form) {
    console.error("❌ addProjectForm not found");
    return;
  }

  const CLOUD_NAME = "djtjixlhw";
  const UPLOAD_PRESET = "portfolio_unsigned";

  function normalizeDriveUrl(url) {
  if (!url) return "";
  return url.replace("/view", "/preview");
}


  // 🔹 Load Categories
  async function loadCategories() {
    const snapshot = await getDocs(collection(db, "category"));

    categorySelect.innerHTML = `<option value="">Select Category</option>`;

    snapshot.forEach((doc) => {
      categoryMap[doc.id] = doc.data().name; // 🔥 MAP
      categorySelect.innerHTML += `
      <option value="${doc.id}">${doc.data().name}</option>
    `;
    });
  }

  async function loadStatus() {
    const snapshot = await getDocs(collection(db, "status"));

    statusSelect.innerHTML = `<option value="">Select Status</option>`;

    snapshot.forEach((doc) => {
      statusMap[doc.id] = doc.data().label; // 🔥 MAP
      statusSelect.innerHTML += `
      <option value="${doc.id}">${doc.data().label}</option>
    `;
    });
  }

  loadCategories();
  loadStatus();

  // 🔹 Cloudinary Upload
  async function uploadToCloudinary(file, folder) {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    console.log("☁️ Cloudinary:", data);
    return data.secure_url;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const categoryId = categorySelect.value;
    const viewLive = statusSelect.value;

    if (!categoryId || !viewLive) {
      alert("❌ Please select Category and Status");
      return;
    }

    try {
      const imgURL = await uploadToCloudinary(
        form.img.files[0],
        "projects/images",
        "image"
      );

      const videoURL = await uploadToCloudinary(
        form.video.files[0],
        "projects/videos",
        "video"
      );

      const pdfURL = normalizeDriveUrl(form.usecase_pdf.value);


      await addDoc(collection(db, "projects"), {
        name: form.name.value,
        git_link: form.git_link.value,
        description: form.description.value,

        category_id: categoryId, // ✅ STRING DOC ID
        view_live_id: viewLive, // ✅ STRING DOC ID

        live_link: form.live_link.value || "",

        img: imgURL || null,
        // imgPublicId: img?.public_id || "",

        video: videoURL || null,
        // videoPublicId: video?.public_id || "",

        usecase_pdf: pdfURL || "",

        createdAt: serverTimestamp(),
      });

      alert("🔥 Project added successfully!");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("❌ Error adding project");
    }
  });

  

});
