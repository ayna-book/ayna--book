
import {
  loginUser,
  watchAuthState
} from "./auth.js";

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const button = document.getElementById("loginBtn");
const message = document.getElementById("message");

function showMessage(text, success=false) {
  message.style.display = "block";
  message.textContent = text;
  message.style.border = success
    ? "1px solid #36C275"
    : "1px solid #FF6878";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  button.disabled = true;
  button.textContent = "অপেক্ষা করুন...";

  try {
    const result = await loginUser(
      email.value,
      password.value
    );

    if (!result.success) {
      showMessage(result.message);
      return;
    }

    showMessage("Login সফল হয়েছে। Dashboard খুলছে...", true);

    window.location.replace("./dashboard.html");

  } catch (error) {
    showMessage(error.message || "Login ব্যর্থ হয়েছে।");

  } finally {
    button.disabled = false;
    button.textContent = "LOGIN";
  }
});

watchAuthState((user) => {
  if (user) {
    console.log("AYNA BOOK: Authenticated user detected.");
  }
});

console.log("AYNA BOOK Login Controller Ready.");
