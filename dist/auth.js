'use strict';
/* global hex_sha512 */

class AuthHandler {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  _requestPromise(request, data) {
    return new Promise((resolve, reject) => {
      // stringifying undefined => undefined
      request.send(JSON.stringify(data));
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          if (request.status >= 200 && request.status < 300) {
            resolve(request);
          } else {
            let err = new Error(request.statusText || 'Unsuccessful Xhr response');
            err.request = request;
            reject(err);
          }
        }
      };
    });
  }

  login(username, password) {
    const request = new XMLHttpRequest();
    request.open('POST', `${this.serverUrl}/api`, true);
    request.setRequestHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );
    request.withCredentials = true;
    const data = {
      __u: username,
      __h: hex_sha512(password)
    };
    return this._requestPromise(request, data);
  }

  logout() {
    const request = new XMLHttpRequest();
    request.open('POST', `${this.serverUrl}/api/logout`, true);
    request.withCredentials = true;
    return this._requestPromise(request);
  }

  checkLogin() {
    const request = new XMLHttpRequest();
    request.open('POST', `${this.serverUrl}/api`, true);
    request.withCredentials = true;
    return this._requestPromise(request);
  }
}
