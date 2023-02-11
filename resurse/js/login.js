window.addEventListener("storage", function(event) {
    if (event.storageArea === sessionStorage) {
      if (sessionStorage.getItem('loginMsg') == "ok") {
        alert("Logat cu success!");
        sessionStorage.setItem('loginMsg', '');
      }
      else if(sessionStorage.getItem('loginMsg')) {
        alert(sessionStorage.getItem('loginMsg'));
        sessionStorage.setItem('loginMsg', '');
      }
    }
});
