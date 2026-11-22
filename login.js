import {
  loginUser,
  getAuthErrorMessage
} from "./auth.js";


const form =
  document.getElementById("loginForm");

const button =
  document.getElementById("loginButton");

const message =
  document.getElementById("statusMessage");


form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    message.textContent = "";

    const email =
      document
        .getElementById("email")
        .value
        .trim()
        .toLowerCase();

    const password =
      document
        .getElementById("password")
        .value;


    button.disabled = true;

    button.textContent =
      "LOGGING IN...";


    try {

      await loginUser(
        email,
        password
      );


      message.textContent =
        "Login successful. Opening your account...";


      window.location.href =
        "./profile.html";


    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      message.textContent =
        getAuthErrorMessage(error);

    } finally {

      button.disabled = false;

      button.textContent =
        "LOGIN";
    }
  }
);