window.addEventListener("DOMContentLoaded", function () {
  let temaCurenta = localStorage.getItem("tema");
  fetch("/get_tema")
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      return response.text();
    })
    .then((text) => {
      localStorage.setItem("tema", text);
      temaCurenta = text;
      schimbareTema();
    })
    .catch((err) => {
      console.log("Nu s-a gasit nicio tema in server");
    });

  function schimbareTema() {
    if (temaCurenta === "light") {
      document.body.className = "";
      document.getElementById("toggle-tema").classList = "fas fa-sun";
      document.getElementById("snow").style.display = "none";
    } else if (temaCurenta === "dark") {
      document.body.className = "dark";
      document.getElementById("toggle-tema").classList = "fas fa-moon";
      document.getElementById("snow").style.display = "none";
    } else {
      document.body.className = "craciun";
      document.getElementById("toggle-tema").classList = "fas fa-snowflake";
      document.getElementById("snow").style.display = "block";
    }
    fetch("/set_tema", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tema: temaCurenta,
      }),
    });
  }

  schimbareTema();

  // toggle tema (light->dark->craciun)
  document.getElementById("toggle-tema").addEventListener("click", function () {
    let toggle = document.getElementById("toggle-tema");
    if (temaCurenta === "light") {
      localStorage.setItem("tema", "dark");
      temaCurenta = "dark";
    } else if (temaCurenta === "dark") {
      localStorage.setItem("tema", "craciun");
      temaCurenta = "craciun";
    } else {
      localStorage.setItem("tema", "light");
      temaCurenta = "light";
    }
    schimbareTema();
  });
});
