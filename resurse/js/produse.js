window.addEventListener("load", function () {
  // Set last values
  if (checkIfCookieExists("filters")) {
    console.log(getCookie("filters"));
    let vars = JSON.parse(getCookie("filters"));
    if (vars == null) {
      console.error("Nasol");
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    console.log(vars);
    document.getElementById("cautare-nume").value = vars.nume;
    document.getElementById("cautare-pret").value = vars.pret;
    document.getElementById("pret-curent").innerHTML =
      "Pret curent: " + vars.pret + " RON";
    console.log(urlParams.get('tip'))
    if(urlParams.get('tip') == null){
      document.getElementById("cautare-tipuri").value = vars.tip;
    }
    let date = document.getElementsByName("cautare-date");
    if (vars.date == true) date[0].checked = true;
    else if (vars.date == false) date[1].checked = true;
    else date[2].checked = true;
    document.getElementById("cautare-noutati").checked = vars.noutati;
    document.getElementById("cautare-specs").value = vars.specificatii;
    document.getElementById("cautare-disponibilitate").value =
      vars.disponibilitate;
    let prods = document.getElementById("cautare-producator");
    console.log(prods);
    console.log(vars.producator);
    for (let i = 0; i < vars.producator.length; i++) {
      let values = Array.from(prods.options).map((option) => option.value);
      console.log(values.indexOf(vars.producator[i]));

      prods[values.indexOf(vars.producator[i])].selected = true;
    }
  }
  // Onchange
  let pret_input = document.getElementById("cautare-pret");
  pret_input.onchange = function () {
    // set #pret-curent to value
    document.getElementById("pret-curent").innerHTML =
      "Pret curent: " + pret_input.value + " RON";
    filter();
  };
  // Get variables
  function getVars() {
    var vars = {};
    // Get all values
    // nume
    let nume = document.getElementById("cautare-nume").value;
    if (checkNumericChars(nume)) {
      inputElement.classList.add("is-invalid");
      throw "Prea multe numere in nume!";
    }
    // pret
    let pret = document.getElementById("cautare-pret").value;
    // tip
    let tip = document.getElementById("cautare-tipuri").value;
    // date (radio buttons)
    let date = document.getElementsByName("cautare-date");
    let date_value = "";
    for (let i = 0; i < date.length; i++) {
      if (date[i].checked) {
        if (date[i].value == "da") {
          date_value = true;
        } else if (date[i].value == "nu") {
          date_value = false;
        } else date_value = "oricare";
        break;
      }
    }
    // noutati (checkbox)
    let noutati = document.getElementById("cautare-noutati").checked;
    // specificatii
    let specificatii = document.getElementById("cautare-specs").value;
    // disponibilitate (select)
    let disponibilitate = document.getElementById(
      "cautare-disponibilitate"
    ).value;
    // producator (multiple select)
    let producator = document.getElementById("cautare-producator");
    let producator_value = "";
    for (let i = 0; i < producator.length; i++) {
      if (producator[i].selected) {
        producator_value += producator[i].value + ",";
      }
    }
    // Trim last comma
    producator_value = producator_value.slice(0, -1).split(",");
    // Remove all empty strings from array
    producator_value = producator_value.filter(function (el) {
      return el != "";
    });
    // Add to vars
    vars.nume = nume;
    vars.pret = pret;
    vars.tip = tip;
    vars.date = date_value;
    vars.noutati = noutati;
    vars.specificatii = specificatii;
    vars.disponibilitate = disponibilitate;
    vars.producator = producator_value;
    // Set values to cookies for later user
    if (checkIfCookieExists("accept-cookies"))
      addCookie("filters", JSON.stringify(vars));
    return vars;
  }
  // Filter
  function filter() {
    let produse = document.getElementsByClassName("container-produs");
    let produse_data = [];
    for (let i = 0; i < produse.length; i++) {
      let produs = produse[i];
      let data = {
        nume: produs.getAttribute("data-nume"),
        pret: produs.getAttribute("data-pret"),
        tip: produs.getAttribute("data-tip"),
        date: produs.getAttribute("data-date"),
        noutati:
          new Date(produs.getAttribute("data-aparitie")) >
          new Date("2019-01-01")
            ? "true"
            : "false",
        specificatii: produs.getAttribute("data-specs"),
        disponibilitate: produs.getAttribute("data-disponibilitate"),
        producator: produs.getAttribute("data-producator"),
      };
      produse_data.push(data);
    }
    let vars = getVars();
    for (let i = 0; i < produse_data.length; i++) {
      let produs = produse[i];
      let data = produse_data[i];
      let match = true;
      if (vars.nume != "" && !data.nume.includes(vars.nume)) {
        match = false;
        console.log("nume");
      }
      if (vars.pret != "" && Number(data.pret) > Number(vars.pret)) {
        match = false;
        console.log("pret");
      }
      if (vars.tip != "" && capitalizeFirstLetter(data.tip) != vars.tip) {
        match = false;
        console.log("tip");
      }
      if (vars.date != "oricare" && data.date != vars.date) {
        match = false;
        console.log("date");
      }
      if (vars.noutati && data.noutati != "true") {
        match = false;
        console.log("noutati");
      }
      if (
        vars.specificatii != "" &&
        !data.specificatii.includes(vars.specificatii)
      ) {
        match = false;
        console.log("specs");
      }
      if (
        vars.disponibilitate != "oricare" &&
        data.disponibilitate != vars.disponibilitate
      ) {
        match = false;
        console.log("disponibilitate");
      }
      if (
        vars.producator.length > 0 &&
        !vars.producator.includes(data.producator)
      ) {
        match = false;
        console.log("producator");
      }
      // Add/remove the "none" class
      if (match) {
        produs.classList.remove("none");
      } else {
        produs.classList.add("none");
      }
    }
  }
  let filterBtn = document.getElementById("cautare-btn");
  filterBtn.addEventListener("click", () => {
    try {
      filter();
    } catch (e) {
      this.alert(e);
    }
  });

  // onchange filter pe tot
  document.getElementById("cautare-nume").onchange = filter;
  document.getElementById("cautare-tipuri").onchange = filter;
  document
    .getElementsByName("cautare-date")
    .forEach((e) => (e.onchange = filter));
  document.getElementById("cautare-noutati").onchange = filter;
  document.getElementById("cautare-specs").onchange = filter;
  document.getElementById("cautare-disponibilitate").onchange = filter;
  document.getElementById("cautare-producator").onchange = filter;
  // Reset
  function reset() {
    document.getElementById("pret-curent").innerHTML =
      "Pret curent: " + 10000 + " RON";
    let produse = document.getElementsByClassName("container-produs");
    for (let i = 0; i < produse.length; i++) {
      let produs = produse[i];
      produs.classList.remove("none");
      produs.style.order = "";
    }
    // Reset all inputs
    document.getElementById("cautare-nume").value = "";
    document.getElementById("cautare-pret").value = 10000;
    if (document.getElementById("cautare-tipuri").disabled == false) {
      document.getElementById("cautare-tipuri").value = "";
    }
    document.getElementById("cautare-noutati").checked = false;
    document.getElementById("cautare-specs").value = "";
    document.getElementById("cautare-disponibilitate").value = "oricare";
    document.getElementById("cautare-producator").value = "";
    let date = document.getElementsByName("cautare-date");
    date[2].checked = true;
    date[1].checked = false;
    date[0].checked = false;
  }
  let resetBtn = document.getElementById("resetare-btn");
  resetBtn.addEventListener("click", () => {
    try {
      reset();
    } catch (e) {
      this.alert(e);
    }
  });

  // Sortare
  function sort(callback_sort) {
    // Get all products
    let produse = document.getElementsByClassName("container-produs");
    let produse_data = [];
    for (let i = 0; i < produse.length; i++) {
      let produs = produse[i];
      let data = {
        i: i,
        nume: produs.getAttribute("data-nume"),
        pret: Number(produs.getAttribute("data-pret")),
        tip: produs.getAttribute("data-tip"),
        date: produs.getAttribute("data-date"),
        noutati:
          new Date(produs.getAttribute("data-aparitie")) >
          new Date("2019-01-01")
            ? "true"
            : "false",
        specificatii: produs.getAttribute("data-specs"),
        disponibilitate: produs.getAttribute("data-disponibilitate"),
        producator: produs.getAttribute("data-producator"),
        dimensiune: Number(produs.getAttribute("data-dimensiune")),
      };
      produse_data.push(data);
    }
    // Sort
    produse_data.sort(callback_sort);
    // Set the css order property for each product
    for (let i = 0; i < produse_data.length; i++) {
      let produs = produse[produse_data[i].i];
      produs.style.order = i + 1;
    }
  }
  // asc
  let sortAscBtn = document.getElementById("sortare-btn");
  sortAscBtn.addEventListener("click", () => {
    try {
      sort(function (a, b) {
        if (a.nume != b.nume) {
          return a.nume.localeCompare(b.nume);
        } else {
          return a.dimensiune / a.pret - b.dimensiune / b.pret;
        }
      });
    } catch (e) {
      this.alert(e);
    }
  });
  // desc
  let sortDescBtn = document.getElementById("sortare-desc-btn");
  sortDescBtn.addEventListener("click", function () {
    try {
      sort(function (a, b) {
        if (a.nume != b.nume) {
          return b.nume.localeCompare(a.nume);
        } else {
          return b.dimensiune / b.pret - a.dimensiune / a.pret;
        }
      });
    } catch (e) {
      this.alert(e);
    }
  });
  // Calc medie
  function calcMedie() {
    let produse = document.getElementsByClassName("container-produs");
    let produse_data = [];
    for (let i = 0; i < produse.length; i++) {
      let produs = produse[i];
      // check if the product is visible
      if (produs.classList.contains("none")) {
        continue;
      }
      let data = {
        i: i,
        nume: produs.getAttribute("data-nume"),
        pret: Number(produs.getAttribute("data-pret")),
        tip: produs.getAttribute("data-tip"),
        date: produs.getAttribute("data-date"),
        noutati:
          new Date(produs.getAttribute("data-aparitie")) >
          new Date("2019-01-01")
            ? "true"
            : "false",
        specificatii: produs.getAttribute("data-specs"),
        disponibilitate: produs.getAttribute("data-disponibilitate"),
        producator: produs.getAttribute("data-producator"),
      };
      produse_data.push(data);
    }
    let sum = 0;
    for (let i = 0; i < produse_data.length; i++) {
      sum += produse_data[i].pret;
    }
    let medie = sum / produse_data.length;
    // create a new div element after #filtre
    let div = document.createElement("div");
    div.setAttribute("id", "medie");
    div.innerHTML = "Media preturilor este: " + medie.toFixed(2) + " RON";
    let filtre = document.getElementById("filtre");
    filtre.parentNode.insertBefore(div, filtre.nextSibling);
    // remove the div after 2 seconds
    setTimeout(function () {
      div.parentNode.removeChild(div);
    }, 2000);
  }
  let calcMedieBtn = document.getElementById("calculare-btn");
  calcMedieBtn.addEventListener("click", () => {
    try {
      calcMedie();
    } catch (e) {
      this.alert(e);
    }
  });

  function checkNumericChars(str) {
    let numCharCount = 0;

    for (let i = 0; i < str.length; i++) {
      if (str[i] >= "0" && str[i] <= "9") {
        numCharCount++;
      }
    }

    return numCharCount > 3;
  }

  let inputElement = document.getElementById("cautare-nume");
  inputElement.addEventListener("change", (e) => {
    if (checkNumericChars(e.target.value)) {
      this.alert("Prea multe numere in nume!");
      inputElement.classList.add("is-invalid");
    } else {
      try {
        inputElement.classList.remove("is-invalid");
      } catch (e) {}
    }
  });
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
