'use strict';
/* global AuthHandler */

function showResults(title, content) {
  console.log('title', title);
  console.log('content', content);
  document.getElementById('result-title').innerText = title;
  document.getElementById('result-content').innerText = content;
}

window.onload = () => { // Set up the click listeners
  const auth = new AuthHandler('NOURL');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const testBtn = document.getElementById('test-btn');
  loginBtn.onclick = () => {
    const url = document.getElementById('url').value;
    auth.serverUrl = url;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    auth.login(username, password)
      .then(request => {
        showResults('response:', request.responseText);
      })
      .catch(err => {
        showResults('no response', err.request);
      });
  };

  testBtn.onclick = () => {
    const url = document.getElementById('url').value;
    auth.serverUrl = url;
    // Try to login without a username and get the response
    auth.checkLogin()
      .then(_ => {
        showResults('Logged in?', true);
      })
      .catch(_ => {
        showResults('Logged in?', false);
      });
  };

  logoutBtn.onclick = () => {
    const url = document.getElementById('url').value;
    auth.serverUrl = url;

    auth.logout()
      .then(request => {
        showResults('response:', request.responseText);
      });
  };
};

