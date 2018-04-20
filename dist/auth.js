'use strict';
/* global hex_sha512 */

class AuthHandler {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  _requestPromise(request, data) {
    return new Promise((resolve, reject) => {
      // stiringifiying undefined => undefined
      console.log('making a request');
      request.send(JSON.stringify(data));
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          resolve(request);
        }
      };
      // TODO reject on error
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
