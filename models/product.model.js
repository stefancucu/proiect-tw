const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Produse = sequelize.define("produse", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    nume: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dimensiune: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    img: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tip_produs: {
      type: DataTypes.ENUM,
      values: ["telefon", "tableta", "laptop", "smartwatch", "accesorii"],
      allowNull: false,
    },
    disponibilitate: {
      type: DataTypes.ENUM,
      values: ["in stoc", "stoc furnizor", "precomanda", "indisponibil"],
      allowNull: false,
    },
    pret: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    data_aparitie: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    producator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specificatii: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date_5g: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    descriere: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
  return Produse;
};
