const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Utilizatori = sequelize.define("utilizatori", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nume: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prenume: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parola: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data_nasterii: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    data_inregistrarii: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    culoare_chat: {
      type: DataTypes.STRING,
      defaultValue: "black",
      allowNull: false,
    },
    rol: {
      type: DataTypes.STRING,
      defaultValue: "comun",
      allowNull: false,
    },
    telefon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imagine_profil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    confirmed: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
    tema: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "light"
    },
    tries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true
    },
    first_try: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_try: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return Utilizatori;
};
