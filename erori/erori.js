const fs = require("fs");
const path = require("path");

const erori = JSON.parse(
  fs.readFileSync(path.join(__dirname, "erori.json"), "utf8")
);

module.exports = function renderError(
  res,
  identificator,
  tipuri = [],
  titlu,
  text,
  imagine,
) {
  var eroare = erori.info_erori.find(function (elem) {
    return elem.identificator == identificator;
  });
  titlu = titlu || (eroare && eroare.titlu) || erori.eroare_default.titlu;
  text = text || (eroare && eroare.text) || erori.eroare_default.text;
  imagine =
    imagine ||
    (eroare && erori.cale_baza + "/" + eroare.imagine) ||
    erori.cale_baza + "/" + erori.eroare_default.imagine;
  if (eroare && eroare.status) {
    res.status(identificator).render("pagini/eroare", {
      titlu: titlu,
      text: text,
      imagine: imagine,
      status: identificator,
      tipuri: tipuri,
    });
  } else {
    res.render("pagini/eroare", {
      titlu: titlu,
      text: text,
      imagine: imagine,
      status: identificator,
      tipuri: tipuri,
    });
  }
};
