const express = require("express");
const debug = require("debug")("app:server");
let mysql = require("mysql");

const app = express();
const renderError = require("./erori/erori.js");
const fetchImages = require("./galerie/galerie.js");
const { capitalizeFirstLetter } = require("./utils");

let connection = mysql.createConnection({
  host: "localhost",
  user: "quickgsm",
  password: "password",
  database: "proiect_tw",
});
connection.connect();

app.set("view engine", "ejs");

console.log("Cale proiect", __dirname);

app.use("/resurse", express.static(__dirname + "/resurse"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.get("/produse", (req, res) => {
  console.log("Userul a cerut pagina: ", "/produse");
  fetchImages().then((images) => {
    connection.query(
      'SHOW COLUMNS FROM produse WHERE Field = "tip_produs"',
      (error, results) => {
        if (error) throw error;
        const type = results[0].Type.slice(0, -1); // ar trebui sa returneze "enum('telefon', 'tableta', 'laptop', 'smartwatch', 'accesorii')"
        const values = type.split("(")[1].split("','"); // ar trebui sa returneze ["telefon", "tableta", "laptop", "smartwatch", "accesorii"]
        for (let i = 0; i < values.length; i++) {
          values[i] = values[i].replace(/'/g, "");
        }
        connection.query("SELECT * FROM produse", (error, results) => {
          if (error) throw error;
          res.render("pagini/produse", {
            user: {
              ip: req.ip,
              images: images,
            },
            produse: req.query.tip ? results.filter((produs) => produs.tip_produs == req.query.tip.toLowerCase()) : results,
            tipuri: capitalizeFirstLetter(values),
            tip_selectat: req.query.tip,
          });
        });
      }
    );
  });
});

app.get("/produse/:id", (req, res) => {
  fetchImages().then((images) => {
    connection.query(
      'SHOW COLUMNS FROM produse WHERE Field = "tip_produs"',
      (error, results) => {
        if (error) throw error;
        const type = results[0].Type.slice(0, -1); // ar trebui sa returneze "enum('telefon', 'tableta', 'laptop', 'smartwatch', 'accesorii')"
        const values = type.split("(")[1].split("','"); // ar trebui sa returneze ["telefon", "tableta", "laptop", "smartwatch", "accesorii"]
        for (let i = 0; i < values.length; i++) {
          values[i] = values[i].replace(/'/g, "");
        }
        connection.query("SELECT * FROM produse", (error, results) => {
          if (error) throw error;
          res.render("pagini/produs", {
            user: {
              ip: req.ip,
              images: images,
            },
            produs: results.filter((produs) => produs.id == req.params.id)[0],
            tipuri: capitalizeFirstLetter(values),
          });
        });
      }
    );
  });
});


app.get("/home", (req, res) => {
  console.log("Userul a cerut pagina: ", "/index");
  fetchImages().then((images) => {
    connection.query(
      'SHOW COLUMNS FROM produse WHERE Field = "tip_produs"',
      (error, results) => {
        if (error) throw error;
        const type = results[0].Type.slice(0, -1); // ar trebui sa returneze "enum('telefon', 'tableta', 'laptop', 'smartwatch', 'accesorii')"
        const values = type.split("(")[1].split("','"); // ar trebui sa returneze ["telefon", "tableta", "laptop", "smartwatch", "accesorii"]
        for (let i = 0; i < values.length; i++) 
          values[i] = values[i].replace(/'/g, "");
        console.log(values);
        res.render("pagini/index", {
          user: {
            ip: req.ip,
            images: images,
          },
          tipuri: capitalizeFirstLetter(values),
        });
      }
    );
  });
});

app.get("*.ejs", (req, res) => {
  renderError(res, 403);
});

app.get("/*", (req, res) => {
  console.log("Userul a cerut pagina: ", req.url);
  try {
    fetchImages().then((images) => {
      connection.query(
        'SHOW COLUMNS FROM produse WHERE Field = "tip_produs"',
        (error, results) => {
          if (error) throw error;
          const type = results[0].Type.slice(0, -1); // ar trebui sa returneze "enum('telefon', 'tableta', 'laptop', 'smartwatch', 'accesorii')"
          const values = type.split("(")[1].split("','"); // ar trebui sa returneze ["telefon", "tableta", "laptop", "smartwatch", "accesorii"]
          for (let i = 0; i < values.length; i++) 
            values[i] = values[i].replace(/'/g, "");
          res.render(
            "pagini" + req.url,
            {
              user: {
                ip: req.ip,
                images: images,
              },
              tipuri: capitalizeFirstLetter(values),
            },
            (err, html) => {
              if (err) {
                console.log("Eroare la incarcarea paginii: ", err);
                renderError(res, 404);
              } else {
                res.send(html);
              }
            }
          );
        });
    });
  } catch {
    renderError(res, 404);
  }
});

app.listen(8080, () => {
  console.log("Aplicatia asculta pe portul 8080");
});
