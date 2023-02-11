window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#submit").addEventListener("click", function (event) {
      const password = document.querySelector("#parola").value;
      const rePassword = document.querySelector("#reintroducere_parola").value;
      
      if (password !== rePassword) {
        alert("Parolele nu coincid");
        return;
      }

      fetch("/resetare_parola", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: password }),
      })
        .then((response) => {
          if (response.ok) {
            alert("Parola schimbata cu succes! Va puteti autentifica acum.");
            window.location.href = "/";
          } else {
            alert("Fail");
          }
        })
        .catch((err) => console.error(err));
    });
  });
  