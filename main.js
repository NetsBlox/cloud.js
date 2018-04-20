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
        if (request.responseText) {
          // Show the response somewhere...
          showResults('response:', request.responseText);
        } else {
          showResults('no response', request);
        }
      });
  };

  testBtn.onclick = () => {
    const url = document.getElementById('url').value;
    auth.serverUrl = url;
    // Try to login without a username and get the response
    auth.checkLogin()
      .then(req => {
        showResults('Logged in?', req.status < 400);
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

