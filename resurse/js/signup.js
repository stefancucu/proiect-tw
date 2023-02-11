window.addEventListener("DOMContentLoaded", () => {
  const alertmsg = document.getElementById("pmsg");
  const alert = document.getElementById("alert");
  if(alertmsg.innerHTML.length == 0) {
    alert.style.opacity = 0;
  } 
  else {
    alert.style.opacity = 1;
  }
  document.querySelector("form").addEventListener("submit", function (event) {
    const password = document.querySelector("#parola").value;
    const rePassword = document.querySelector("#reintroducere_parola").value;
    const phone = document.querySelector("#telefon").value;

    if (password !== rePassword) {
      alertmsg.innerHTML = "Parolele nu coincid!";
      alert.style.opacity = 1;
      event.preventDefault();
    }

    const phoneRegex = /^\+?[0][0-9]{9,}$/;
    if (!phoneRegex.test(phone) && phone.length > 0) {
      alertmsg.innerHTML = "Numărul de telefon nu este valid!";
      alert.style.opacity = 1;
      event.preventDefault();
    }

    // Validation 1: Check if the email address has the right format
    const email = document.querySelector("#email").value;
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      alertmsg.innerHTML = "Adresa de email nu este validă!";
      alert.style.opacity = 1;
      event.preventDefault();
    }

    // Validation 2: Check if the password has at least 6 characters
    if (password.length < 6) {
      alertmsg.innerHTML = "Parola trebuie să aibă cel puțin 6 caractere!";
      alert.style.opacity = 1;
      event.preventDefault();
    }
    if(alertmsg.innerHTML.length == 0) {
        alert.style.opacity = 0;
      } 
  });
});
