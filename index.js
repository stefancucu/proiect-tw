const express = require("express");
const debug = require("debug")("app:server");

const app = express();
const renderError = require("./erori/erori.js");
const fetchImages = require("./galerie/galerie.js");

app.set("view engine", "ejs");

console.log("Cale proiect", __dirname);

app.use("/resurse", express.static(__dirname + "/resurse"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.get("/home", (req, res) => {
  console.log("Userul a cerut pagina: ", "/index");
  fetchImages().then((images) => {
    // console.log("Am primit imaginile", images);
    res.render("pagini/index", {
      user: {
        ip: req.ip,
        images: images,
      },
    });
  });
});

app.get("*.ejs", (req, res) => {
  renderError(res, 403);
});

app.get("/*", (req, res) => {
  console.log("Userul a cerut pagina: ", req.url);
  try {
    fetchImages().then((images) => {
    res.render(
      "pagini" + req.url,
      {
        user: {
          ip: req.ip,
          images: images,
        },
      },
      (err, html) => {
        if (err) {
          console.log("Eroare la incarcarea paginii: ", err);
          renderError(res, 404);
        } else {
          res.send(html);
        }
      }
    )});
  } catch {
    renderError(res, 404);
  }
});

app.listen(8080, () => {
  console.log("Aplicatia asculta pe portul 8080");
});
