window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#submit").addEventListener("click", function (event) {
        fetch("/cerere_reset", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: document.querySelector("#username").value }),
          })
            .then((response) => {
              if (response.ok) {
                alert("Cerere realizata cu success! Daca utilizatorul exista, veti primi un email pentru resetarea contului!");
              } else {
                alert("Fail");
              }
            })
            .catch((err) => console.error(err));
    });
  });
  