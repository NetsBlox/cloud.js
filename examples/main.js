"use strict";
/* global Cloud */

function showResults(title, content) {
  document.getElementById("result-title").innerText = title;
  document.getElementById("result-content").innerText = content;
}

window.onload = () => { // Set up the click listeners
  let client = new Cloud(document.getElementById("url").value);
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const testBtn = document.getElementById("test-btn");
  loginBtn.onclick = () => {
    const url = document.getElementById("url").value;
    client = new Cloud(url);
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    client.login(username, password)
      .then((username) => {
        showResults("response:", username);
      })
      .catch((err) => {
        showResults("response", err);
      });
  };

  testBtn.onclick = () => {
    const url = document.getElementById("url").value;
    client = new Cloud(url);
    // Try to login without a username and get the response
    client.getProfile()
      .then((user) => {
        showResults("logged in user:", JSON.stringify(user));
      })
      .catch(() => {
        showResults("Logged in?", false);
      });
  };

  logoutBtn.onclick = () => {
    const url = document.getElementById("url").value;
    client = new Cloud(url);

    client.logout()
      .then((response) => {
        showResults("response:", response);
      });
  };
};
