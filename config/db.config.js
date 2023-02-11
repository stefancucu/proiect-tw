module.exports = {
    HOST: "localhost",
    USER: "quickgsm",
    PASSWORD: "password",
    DB: "proiect_tw",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };