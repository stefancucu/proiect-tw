const express = require("express");
const session = require("express-session");
const debug = require("debug")("app:server");
let mysql = require("mysql");

const app = express();
const renderError = require("./erori/erori.js");
const fetchImages = require("./galerie/galerie.js");
const { capitalizeFirstLetter, chooseRandomValues } = require("./utils");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const User = require("./users/users.js");
const Passwords = require("./users/passwords.js");
const Sequelize = require("sequelize");
const accessDB = require("./models/models").getInstanta();
const Users = accessDB.db.users;
const Products = accessDB.db.products;
const { generateFromEmail } = require("unique-username-generator");
let tipuri = [];
let connection = mysql.createConnection({
  host: "localhost",
  user: "quickgsm",
  password: "password",
  database: "proiect_tw",
});
connection.connect();
connection.query(
  'SHOW COLUMNS FROM produse WHERE Field = "tip_produs"',
  (error, results) => {
    if (error) throw error;
    const type = results[0].Type.slice(0, -1); // ar trebui sa returneze "enum('telefon', 'tableta', 'laptop', 'smartwatch', 'accesorii')"
    const values = type.split("(")[1].split("','"); // ar trebui sa returneze ["telefon", "tableta", "laptop", "smartwatch", "accesorii"]
    for (let i = 0; i < values.length; i++) {
      values[i] = values[i].replace(/'/g, "");
    }
    tipuri = capitalizeFirstLetter(values);
  }
);

app.set("view engine", "ejs");

console.log("Cale proiect", __dirname);

app.use("/resurse", express.static(__dirname + "/resurse"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));
app.use(
  session({
    secret: "quickgsm",
    resave: true,
    saveUninitialized: false,
  })
);
app.use(express.json());

app.use(function (req, res, next) {
  fs.readFile("./maintenance.json", (err, data) => {
    if (err) {
      res.status(500).send("Eroare la citirea fisierului de mentenanta");
      return;
    }

    const options = JSON.parse(data);
    if (options.maintenance) {
      renderError(res, 503, tipuri);
      return;
    }

    next();
  });
});

app.get("/carousel", (req, res) => {
  connection.query("SELECT * FROM produse", (error, results) => {
    if (error) throw error;
    res.json(chooseRandomValues(results, 5));
  });
});

app.get("/produse", (req, res) => {
  console.log("Userul a cerut pagina: ", "/produse");
  let loginMsg = null;
  if (req.session.loginMsg) {
    loginMsg = req.session.loginMsg;
    req.session.loginMsg = null;
  }
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
            produse: req.query.tip
              ? results.filter(
                  (produs) => produs.tip_produs == req.query.tip.toLowerCase()
                )
              : results,
            tipuri: capitalizeFirstLetter(values),
            tip_selectat: req.query.tip,
            username: req.session.user ? req.session.user._username : null,
            role: req.session.user ? req.session.user.role.code : null,
            loginMsg: loginMsg,
          });
        });
      }
    );
  });
});

app.get("/produse/:id", (req, res) => {
  let loginMsg = null;
  if (req.session.loginMsg) {
    loginMsg = req.session.loginMsg;
    req.session.loginMsg = null;
  }
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
            username: req.session.user ? req.session.user._username : null,
            role: req.session.user ? req.session.user.role.code : null,
            loginMsg: loginMsg,
          });
        });
      }
    );
  });
});

app.post("/signup", (req, res) => {
  let form = new formidable.IncomingForm({
    maxFileSize: 100 * 1024 * 1024, // 100 MB
  });
  let user = new User({});
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    try {
      let lastName = fields.nume;
      if (!lastName) {
        throw new Error("Nume gol!");
      }
      let firstName = fields.prenume;
      if (!firstName) {
        throw new Error("Prenume gol!");
      }
      let username = fields.username;
      if (!username) {
        throw new Error("Username gol!");
      }
      let password = fields.parola;
      if (!password) {
        throw new Error("Parola goala!");
      }
      let email = fields.email;
      if (!email) {
        throw new Error("Email gol!");
      }
      let birthDate = fields.data_nasterii;
      let chat_color = fields.culoare_chat;
      let phone = fields.telefon;
      if (phone.length > 0) {
        phone = null;
      }
      user.lastName = lastName;
      user.firstName = firstName;
      user.username = username;
      user.password = password;
      user.email = email;
      if (birthDate) {
        user.birthDate = new Date(Date.parse(birthDate));
      } else user.birthDate = null;
      user.chat_color = chat_color;
      user.phone = phone;
      user.joinDate = new Date();
      if (files.fotografie) {
        console.log("files:");
        console.log(files);
        if (files.fotografie.size > 0) {
          let folderUser = path.join(
            __dirname,
            "poze_uploadate",
            user.username
          );
          console.log(folderUser);
          if (!fs.existsSync(folderUser)) fs.mkdirSync(folderUser);
          let oldpath = files.fotografie.filepath;
          let newpath = path.join(
            folderUser,
            files.fotografie.originalFilename
          );
          user.picture = newpath;
          fs.rename(oldpath, newpath, (err) => {
            if (err) throw err;
          });
        }
      }
      User.getUserByUsername(username, {}, (u, param) => {
        if (u) {
          let suggestions = [
            generateFromEmail(email, 2),
            generateFromEmail(email, 3),
            generateFromEmail(email, 4),
          ];
          console.log(u);
          res.render("pagini/signup", {
            err: `Acest user deja exista!\nSugestii: ${suggestions}`,
            tipuri: tipuri,
            sugestii: suggestions,
            username: req.session.user ? req.session.user._username : null,
            role: req.session.user ? req.session.user.role.code : null,
          });
        } else {
          user.saveUser();
          res.render("pagini/signup", {
            err: "Cont creat cu succes! Verificati-va adresa de email!",
            tipuri: tipuri,
            ok: 1,
            username: req.session.user ? req.session.user._username : null,
            role: req.session.user ? req.session.user.role.code : null,
          });
        }
      });
    } catch (e) {
      res.render("pagini/signup", {
        err: e.message,
        tipuri: tipuri,
        username: req.session.user ? req.session.user._username : null,
        role: req.session.user ? req.session.user.role.code : null,
      });
    }
    form.on("fileBegin", (name, file) => {
      let folderUser = path.join(__dirname, "poze_uploadate", user.username);
      console.log(folderUser);
      if (!fs.existsSync(folderUser)) fs.mkdirSync(folderUser);
      file.filepath = path.join(folderUser, file.originalFilename);
    });
  });
});

app.post("/login", (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    let username = fields.username;
    let pass = fields.parola;
    User.getUserByUsername(
      username,
      { req: req, res: res, pass: pass },
      (user, param) => {
        console.log(user);
        if (user == null) {
          param.req.session.loginMsg =
            "Date logare incorecte sau nu a fost confirmat mailul!";
          param.res.redirect("/home");
          return;
        }
        let encrpytedPass = User.encryptPassword(pass);
        if (user.password == encrpytedPass && user.confirmed) {
          Users.findOne({
            where: {
              username: username,
            },
          }).then((userData) => {
            userData.update({
              tries: 0,
              first_try: null,
              last_try: null,
            });
          });
          param.req.session.user = user;
          param.res.redirect("/home");
        } else {
          console.log("ceva");
          let tries = user.tries;
          let first_try = user.first_try;
          let last_try = user.last_try;
          console.log(tries);
          console.log(first_try);
          console.log(last_try);
          let t = 1 * 60 * 1000;
          let T = 2 * 60 * 1000;
          let k = 3;
          if (!first_try || first_try > new Date(Date.now() - t)) {
            new_first_try = first_try;
            if (!first_try) {
              new_first_try = new Date();
            }
            if (tries == k) {
              user.modifyData({
                tries: tries + 1,
              });
              user.sendEmail(
                "Avertisment - incercari succesive esuate de logare",
                "Va avertizam ca cineva a incercat de repetate ori sa va acceseze contul."
              );
              param.req.session.loginMsg =
                "Ai gresit de prea multe ori! Se va bloca logarea temporar!";
            } else if (tries < k) {
              tries += 1;
              last_try = new Date();
              user.modifyData({
                tries: tries,
                first_try: new_first_try,
                last_try: last_try,
              });
            } else {
              param.req.session.loginMsg = `Blocat pana la ${new Date(
                last_try.getTime() + T
              )}`;
            }
          } else {
            if (tries >= k && last_try.getTime() + T > Date.now()) {
              param.req.session.loginMsg = `Blocat pana la ${new Date(
                last_try.getTime() + T
              )}`;
            } else {
              user.modifyData({
                tries: 1,
                first_try: new Date(),
                last_try: new Date(),
              });
            }
          }
          param.req.session.loginMsg = param.req.session.loginMsg
            ? param.req.session.loginMsg
            : "Date logare incorecte sau nu a fost confirmat mailul!";
          param.res.redirect("/home");
        }
      }
    );
  });
});

app.post("/set_role", (req, res) => {
  console.log(req.body);
  let username = req.body.username;
  let role = req.body.role;
  if (!req.session.user) {
    res.sendStatus(403);
    return;
  }
  if (req.session.user.role.code !== "admin") {
    res.sendStatus(403);
    return;
  }
  Users.findOne({
    where: {
      username: username,
    },
  }).then((user) => {
    user.update({
      rol: role,
    });
    User.getUserByUsername(username, {}, (userObj, param) => {
      userObj
        .sendEmail(
          "Rolul dvs. a fost schimbat",
          `Ati fost ${
            role == "admin" ? "promovat" : "retrogradat"
          } la rolul ${role}`
        )
        .then(() => {
          res.sendStatus(200);
        });
    });
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/home");
});

app.get("/cod_mail/:token/:username", (req, res) => {
  let token1 = req.params.token.split("-")[0];
  let token2 = req.params.token.split("-")[1];
  let username = req.params.username;
  console.log(token1 + " " + token2);

  User.getUserByUsername(
    username,
    { token1: token1, token2: token2 },
    (user, param) => {
      if (!user) {
        res.status(404).send("Nu s-a gasit utilizatorul!");
        return;
      }
      if (
        param.token1 === user.token &&
        param.token2 === String(Math.floor(user.joinDate.getTime() / 1000))
      ) {
        user.confirmEmail();
        res.redirect("/home");
      } else {
        res.status(403).send("Token-uri invalide!");
      }
    }
  );
});

app.post("/cerere_reset", (req, res) => {
  let username = req.body.username;
  if (!username) {
    res.sendStatus(404);
    return;
  }

  Users.findOne({
    where: {
      username: username,
    },
  }).then((userData) => {
    if (!userData) {
      res.sendStatus(200);
      return;
    }
    let newToken = Passwords.generateToken(50).toLowerCase();
    userData
      .update({
        token: newToken,
      })
      .then(() => {
        User.getUserByUsername(username, {}, (user, param) => {
          if (!user) {
            res.sendStatus(200);
            return;
          }
          user.sendEmail(
            "Cerere resetare parola",
            "Ati cerut resetarea parolei",
            `<p>Pentru a va reseta parola va rugam accesati <a href="http://${User.domainName}/resetare_parola/${newToken}/${username}">acest link</a>.</p>`
          );
        });
        res.sendStatus(200);
        return;
      });
  });
});

app.get("/resetare_parola/:token/:username", (req, res) => {
  let token = req.params.token;
  let username = req.params.username;
  console.log(token);
  console.log(username);
  User.getUserByUsername(username, {}, (user, param) => {
    console.log(user);
    if (!user) {
      renderError(res, 403);
      return;
    }
    if (user.token !== token) {
      renderError(res, 403);
      return;
    }
    req.session.username_reset = username;
    res.render("pagini/resetare_parola", {
      tipuri: tipuri,
      username: req.session.user ? req.session.user._username : null,
      role: req.session.user ? req.session.user.role.code : null,
    });
  });
});

app.post("/resetare_parola", (req, res) => {
  if (!req.session.username_reset) {
    res.sendStatus(403);
    return;
  }
  let newPass = req.body.password;
  User.getUserByUsername(req.session.username_reset, {}, (user, param) => {
    if (!user) {
      res.sendStatus(404);
      return;
    }
    user.modifyData({ password: newPass });
    res.sendStatus(200);
    return;
  });
});

app.post("/set_tema", (req, res) => {
  if (!req.session.user) {
    res.sendStatus(403);
    return;
  }
  let tema = req.body.tema;
  User.getUserByUsername(req.session.user._username, {}, (user, param) => {
    if (!user) {
      res.sendStatus(403);
      return;
    }
    user.modifyData({ tema: tema });
    res.sendStatus(200);
    return;
  });
});

app.get("/get_tema", (req, res) => {
  if (!req.session.user) {
    res.sendStatus(403);
    return;
  }
  res.send(req.session.user.tema);
});

app.get("/home", (req, res) => {
  console.log("Userul a cerut pagina: ", "/index");
  let loginMsg = null;
  if (req.session.loginMsg) {
    loginMsg = req.session.loginMsg;
    req.session.loginMsg = null;
  }
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
          username: req.session.user ? req.session.user._username : null,
          role: req.session.user ? req.session.user.role.code : null,
          loginMsg: loginMsg,
        });
      }
    );
  });
});

app.get("/users", (req, res) => {
  if (!req.session.user) {
    renderError(res, 403);
    return;
  }
  if (req.session.user.role.code !== "admin") {
    res.locals.username = req.session.user ? req.session.user._username : null;
    res.locals.role = req.session.user ? req.session.user.role.code : null;
    renderError(res, 403);
    return;
  }

  Users.findAll({
    where: {
      username: { [Sequelize.Op.not]: req.session.user._username },
    },
  }).then((userDatas) => {
    res.render("pagini/users", {
      tipuri: tipuri,
      users: userDatas.map((userData) => {
        return {
          username: userData.username,
          nume: userData.nume + " " + userData.prenume.charAt(0) + ".",
          rol: userData.rol,
        };
      }),
      username: req.session.user ? req.session.user._username : null,
      role: req.session.user ? req.session.user.role.code : null,
    });
  });
});

app.get("/manage_products", (req, res) => {
  if (!req.session.user) {
    renderError(res, 403);
    return;
  }
  if (req.session.user.role.code !== "admin") {
    res.locals.username = req.session.user ? req.session.user._username : null;
    res.locals.role = req.session.user ? req.session.user.role.code : null;
    renderError(res, 403);
    return;
  }
  res.render("pagini/manage_products", {
    tipuri: tipuri,
    username: req.session.user ? req.session.user._username : null,
    role: req.session.user ? req.session.user.role.code : null,
  });
});

app.post("/manage_products", (req, res) => {
  if (!req.session.user) {
    renderError(res, 403);
    return;
  }
  if (req.session.user.role.code !== "admin") {
    res.locals.username = req.session.user ? req.session.user._username : null;
    res.locals.role = req.session.user ? req.session.user.role.code : null;
    renderError(res, 403);
    return;
  }
  let form = new formidable.IncomingForm({
    maxFileSize: 100 * 1024 * 1024, // 100 MB
  });
  try {
    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
        return;
      }
      let id = fields.id;
      let name = fields.nume;
      let dim = fields.dimensiune;
      let tip = fields.tip_produs;
      let disp = fields.disponibilitate;
      let pret = fields.pret;
      let data = fields.data_aparitie;
      let producator = fields.producator;
      let specs = fields.specificatii;
      let date_5g = fields.date_5g;
      let desc = fields.descriere;
      let img = "";
      if (files.img) {
        if (files.img.size > 0) {
          let folderUser = path.join(__dirname, "resurse", "img", "produse");
          if (!fs.existsSync(folderUser)) fs.mkdirSync(folderUser);
          let oldpath = files.img.filepath;
          let newpath = path.join(folderUser, files.img.originalFilename);
          img = `/resurse/img/produse/${files.img.originalFilename}`;
          if (!fs.existsSync(img)) {
            fs.rename(oldpath, newpath, (err) => {
              if (err) throw err;
            });
          }
        }
      }
      Products.create({
        id: id,
        nume: name,
        dimensiune: dim,
        tip_produs: tip,
        disponibilitate: disp,
        pret: pret,
        data_aparitie: new Date(Date.parse(data)),
        producator: producator,
        specificatii: specs,
        date_5g: date_5g,
        descriere: desc,
        img: img,
      })
        .then(() => {
          res.render("pagini/manage_products", {
            err: "Produs adaugat cu succes!",
            ok: 1,
            tipuri: tipuri,
            username: req.session.user ? req.session.user._username : null,
            role: req.session.user ? req.session.user.role.code : null,
          });
        })
        .catch((err) => {
          console.log(err);
          res.render("pagini/manage_products", {
            err: err.message,
            tipuri: tipuri,
            username: req.session.user ? req.session.user._username : null,
            role: req.session.user ? req.session.user.role.code : null,
          });
        });
    });
  } catch (err) {
    console.log(err);
    res.render("pagini/manage_products", {
      err: err.message,
      tipuri: tipuri,
      username: req.session.user ? req.session.user._username : null,
      role: req.session.user ? req.session.user.role.code : null,
    });
  }
});

app.get("*.ejs", (req, res) => {
  renderError(res, 403);
});

app.get("/favicon.ico", (req, res) => {
  res.send("");
});

app.get("/*", (req, res) => {
  console.log("Userul a cerut pagina: ", req.url);
  let loginMsg = null;
  if (req.session.loginMsg) {
    loginMsg = req.session.loginMsg;
    req.session.loginMsg = null;
  }
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
              username: req.session.user ? req.session.user._username : null,
              role: req.session.user ? req.session.user.role.code : null,
              loginMsg: loginMsg,
            },
            (err, html) => {
              if (err) {
                console.log("Eroare la incarcarea paginii: ", err);
                renderError(res, 404, capitalizeFirstLetter(values));
              } else {
                res.send(html);
              }
            }
          );
        }
      );
    });
  } catch {
    renderError(res, 404);
  }
});

let checkEmailTime = 1 * 60 * 1000; // = t1 = t2
setInterval(() => {
  Users.findAll({
    where: {
      data_inregistrarii: {
        [Sequelize.Op.lt]: new Date(Date.now() - checkEmailTime),
      },
    },
  }).then((data) => {
    console.log(data.length);
    for (let i = 0; i < data.length; i++) {
      let user = data[i];
      if (user.get("confirmed") == 1) {
        continue;
      }
      if (
        user.get("data_inregistrarii") >
        new Date(Date.now() - 2 * checkEmailTime)
      ) {
        console.log("TRIMITEM DOMNE MAIL");
        User.getUserByUsername(user.get("username"), {}, (userObj, param) => {
          console.log(userObj);
          if (!userObj) return;
          userObj.sendEmail(
            "Contul vostru a fost marcat pentru stergere!",
            "Va rugam sa va confirmati email-ul cat mai repede cu putinta!"
          );
        });
      } else {
        user.destroy();
      }
    }
  });
}, checkEmailTime);

app.listen(8080, () => {
  console.log("Aplicatia asculta pe portul 8080");
});
