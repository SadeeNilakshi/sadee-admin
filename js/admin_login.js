import { signInWithEmailAndPassword } from
"https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("errorBox");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    // ✅ Login success
    window.location.href = "index.html";

  } catch (err) {
    errorBox.classList.remove("d-none");
    errorBox.innerText = err.message;
  }
});
