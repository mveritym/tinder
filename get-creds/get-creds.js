var fs = require('fs');
var secrets = require('../secrets');
var page = require('webpage').create();

var constants = require('./constants');
var LOGIN_URL = constants.LOGIN_URL,
    LOGIN_SUCCESS_URL = constants.LOGIN_SUCCESS_URL;

page.onLoadFinished = function(status) {
  if (page.url.indexOf(LOGIN_SUCCESS_URL) !== -1) {
    authorizeTinder();
  }
};

function login() {
  page.evaluate(function (secrets) {
    document.getElementById('email').value = secrets.LOGIN;
    document.getElementById('pass').value = secrets.PASSWORD;
    document.getElementById('loginbutton').click();
  }, secrets);
}

function authorizeTinder() {
  page.evaluate(function() {

    function getAccessToken(res) {
      if (res.url === '/v2.6/dialog/oauth/confirm?dpr=1') {
        var tokenIndex = res.response.indexOf('access_token');
        var endIndex = res.response.indexOf('&expires_in');
        var tokenObj = {'token': res.response.substring(tokenIndex + 'access_token'.length + 1, endIndex)};
        console.log(JSON.stringify(tokenObj));
      }
    }

    function captureXHR() {
      (function(open) {
        XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
          this.addEventListener("readystatechange", function() {
            if (this.readyState === 4) {
              getAccessToken({response: this.responseText, url: url });
            }
          }, false);
          open.call(this, method, url, async, user, pass);
        };
      })(XMLHttpRequest.prototype.open);
    }

    captureXHR();
    document.getElementsByName('__CONFIRM__')[0].click();
  });
}

page.onConsoleMessage = function (msg) {
  var res = JSON.parse(msg);
  if (res.token) {
    secrets.TOKEN = res.token;
    var newSecrets = "module.exports = " + JSON.stringify(secrets) + ";";
    fs.write('../secrets.js', newSecrets, 'w');
    console.log('New token ', res.token, ' written to secrets.js');
    phantom.exit();
  }
};

page.open(LOGIN_URL, function(status) {
  if(status === "success") {
    login();
  } else {
    phantom.exit();
  }
});
