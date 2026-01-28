import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  doc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

function normalizeDriveUrl(url) {
  if (!url) return "";
  return url.replace("/view", "/preview");
}


/* Cloudinary */
const CLOUD_NAME = "djtjixlhw";
const UPLOAD_PRESET = "portfolio_unsigned";

async function uploadToCloudinary(file, type = "image") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`,
    { method: "POST", body: fd }
  );

  const data = await res.json();
  return data.secure_url;
}

/* Load stacks */
async function loadStacks() {
  stackTable.innerHTML = "";
  let i = 1;

  const snap = await getDocs(collection(db, "stacks"));

 snap.forEach(d => {
  const s = d.data();

  stackTable.innerHTML += `
    <tr class="text-center align-middle">
      <td>${i++}</td>

      <td>
        ${s.icon ? `<img src="${s.icon}" width="32" height="32">` : "—"}
      </td>

      <td>${s.name}</td>

      <td>${s.percentage}%</td>

      <td class="d-flex justify-content-center gap-2">
        <a href="edit_stack.html?id=${d.id}"
           class="btn btn-warning btn-sm"
           title="Edit">
          ✏️
        </a>

        <button class="btn btn-danger btn-sm"
          title="Delete"
          onclick="deleteStack('${d.id}')">
          🗑
        </button>
      </td>
    </tr>
  `;
});

}

window.deleteStack = async (id) => {
  if (!confirm("Delete this skill?")) return;
  await deleteDoc(doc(db, "stacks", id));
  loadStacks();
};

/* Add stack */
addStackBtn.addEventListener("click", async () => {
  const nameInput = document.getElementById("stackName");
  const percentageInput = document.getElementById("percentage");
  const orderInput = document.getElementById("order");
  const iconInput = document.getElementById("iconFile");

  const name = nameInput.value.trim();
  const percentage = Number(percentageInput.value);
  const order = Number(orderInput.value);
  const iconFile = iconInput.files[0];

  

  if (!name || percentage < 1 || percentage > 100 || !iconFile) {
    alert("Fill all fields correctly");
    return;
  }

  const iconUrl = await uploadToCloudinary(iconFile, "image");

  await addDoc(collection(db, "stacks"), {
    name,
    percentage,
    order,
    icon: iconUrl
  });

  nameInput.value = "";
  percentageInput.value = "";
  orderInput.value = "";
  iconInput.value = "";

  loadStacks();
});

/* Save CV (Google Drive PDF URL) */
document.getElementById("uploadCVBtn").addEventListener("click", async () => {
  const cvInput = document.getElementById("cvFile");
  const driveUrl = normalizeDriveUrl(cvInput.value.trim());

  if (!driveUrl) {
    alert("Please enter Google Drive PDF URL");
    return;
  }

  if (!driveUrl.includes("drive.google.com")) {
    alert("Please enter a valid Google Drive link");
    return;
  }

  try {
    const btn = document.getElementById("uploadCVBtn");
    btn.disabled = true;
    btn.innerText = "Saving...";

    // 🔥 Save URL in Firestore
    await setDoc(doc(db, "cv", "main"), {
      url: driveUrl,
      updatedAt: serverTimestamp()
    });

    alert("✅ CV saved successfully");
    cvInput.value = "";

  } catch (err) {
    console.error(err);
    alert("❌ CV save failed");
  } finally {
    uploadCVBtn.disabled = false;
    uploadCVBtn.innerText = "Save CV";
  }
});

/* Init */
loadStacks();
