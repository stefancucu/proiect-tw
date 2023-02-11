function addCookie(name, value, time = 43200000) { // Default 12hr
  let date = new Date();
  date.setTime(new Date().getTime() + time);
  console.log("setting cookies");
  document.cookie = name + "=" + value + ";expires=" + date.toUTCString();
}

function deleteCookie(name) {
  var expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() - 1);
  document.cookie = name + "=;expires=" + expirationDate.toUTCString();
}

function deleteAllCookies() {
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var cookieName = cookies[i].split("=")[0];
    deleteCookie(cookieName);
  }
}

function getCookie(name) {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].split("=");
    var cookieName = cookie[0].trim();
    var cookieValue = cookie[1];

    if (cookieName == name) {
      return cookieValue;
    }
  }
  return null;
}
function checkIfCookieExists(name) {
  var cookieValue = getCookie(name);
  if (cookieValue == null) {
    return false;
  }
  return true;
}

window.addEventListener("DOMContentLoaded", () => {
  let bannerElement = document.getElementById("cookiebanner");
  if (getCookie("accept-cookies") == "true") {
    bannerElement.style.display = "none";
  }

  let cookiebtnElement = document.getElementById("cookiebtn");
  cookiebtnElement.addEventListener("click", () => {
    addCookie("accept-cookies", "true", 43200000);
    bannerElement.style.display = "none";
  });
});
