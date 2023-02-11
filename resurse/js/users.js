window.addEventListener("load", () => {
  const buttons = document.getElementsByClassName("promote");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      let username = this.getAttribute("info-btn");
      console.log(username);
      fetch("/set_role", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, role: "admin" }),
      })
        .then((response) => {
          if (response.ok) {
            alert("OK");
            location.reload();
          } else {
            alert("Fail");
          }
        })
        .catch((err) => console.error(err));
    });
  }

  const buttonsDowngrade = document.getElementsByClassName("downgrade");
  for (let i = 0; i < buttonsDowngrade.length; i++) {
    buttonsDowngrade[i].addEventListener("click", function () {
      let username = this.getAttribute("info-btn");
      console.log(username);
      fetch("/set_role", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, role: "comun" }),
      })
        .then((response) => {
          if (response.ok) {
            alert("OK");
            location.reload();
          } else {
            alert("Fail");
          }
        })
        .catch((err) => console.error(err));
    });
  }

  let page = 1;
  let page_in = document.getElementById("page_input");
  let length = page_in.getAttribute("length_users");
  let page_size = 3;
  let max_pages = Math.ceil(length / page_size);
  page_in.setAttribute("max", max_pages);
  page_in.value = page;
  let rows = document.getElementsByClassName("data-row");
  for (let i = 0; i < rows.length; i++) {
    if (i < (page - 1) * 3 || i >= page * 3) {
      rows[i].style.display = "none";
    } else {
      rows[i].style.display = "table-row";
    }
  }

  document.getElementById("next").addEventListener("click", () => {
    if(1 + Number(page) > max_pages){
        return;
    }
    page = 1 + Number(page);
    page_in.value = page;
    let rows = document.getElementsByClassName("data-row");
    for (let i = 0; i < rows.length; i++) {
      if (i < (page - 1) * 3  || i >= page * 3) {
        rows[i].style.display = "none";
      } else {
        rows[i].style.display = "table-row";
      }
    }
  });
  document.getElementById("back").addEventListener("click", () => {
    if(Number(page) - 1 < 1){
        return;
    }
    page -= 1;
    page_in.value = page;   
    let rows = document.getElementsByClassName("data-row");
    for (let i = 0; i < rows.length; i++) {
      if (i < (page - 1) * 3 || i >= page * 3) {
        rows[i].style.display = "none";
      } else {
        rows[i].style.display = "table-row";
      }
    }
  });

});
