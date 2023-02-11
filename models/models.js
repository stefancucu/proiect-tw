const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");

class AccesBD {
  static #instanta = null;
  static #initializat = false;

  constructor() {
    if (AccesBD.#instanta) {
      throw new Error("Deja a fost instantiat");
    } else if (!AccesBD.#initializat) {
      throw new Error(
        "Trebuie apelat doar din getInstanta; fara sa fi aruncat vreo eroare"
      );
    }
  }
  init() {
    this.sequelize = new Sequelize(
      dbConfig.DB,
      dbConfig.USER,
      dbConfig.PASSWORD,
      {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        operatorsAliases: false,

        pool: {
          max: dbConfig.pool.max,
          min: dbConfig.pool.min,
          acquire: dbConfig.pool.acquire,
          idle: dbConfig.pool.idle,
        },
        define: {
          freezeTableName: true,
          timestamps: false,
        },
      }
    );
    this.db = {};

    this.db.Sequelize = Sequelize;
    this.db.sequelize = this.sequelize;

    this.db.users = require("./user.model.js")(this.sequelize, Sequelize);
    this.db.products = require("./product.model.js")(this.sequelize, Sequelize);
    this.db.sequelize.sync();
  }
  static getInstanta(){
    if(!this.#instanta){
        this.#initializat=true;
        this.#instanta=new AccesBD();
        try{
            this.#instanta.init();
        }
        catch (e){
            console.error("Eroare la initializarea bazei de date! " + e.message);
        }
    }
    return this.#instanta;
  }

}
module.exports = AccesBD;
