window.addEventListener("DOMContentLoaded", () => {
    const alertmsg = document.getElementById("pmsg");
    const alert = document.getElementById("alert");
    if(alertmsg.innerHTML.length == 0) {
      alert.style.opacity = 0;
    } 
    else {
      alert.style.opacity = 1;
    }
  });
  