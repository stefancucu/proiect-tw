const accessDB = require("../models/models").getInstanta();
const Users = accessDB.db.users;
const Passwords = require("./passwords.js");
const { RoleFactory } = require("./roles.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const emailConfig = require("../config/email.config");

class User {
  static passwordEncryption = "quickgsm";
  static codeLength = 64;
  static domainName = "localhost:8080";
  #error;

  constructor({
    id,
    username,
    firstName,
    lastName,
    email,
    password,
    birthDate,
    joinDate = Date.now(),
    phone,
    role = "comun",
    chat_color = "black",
    picture,
    token,
    confirmed = 0,
    tema = "light",
    tries = 0,
    first_try,
    last_try,
  } = {}) {
    for (let prop in arguments[0]) {
      this[prop] = arguments[0][prop];
    }
    if (this.role)
      this.role = this.role.code
        ? RoleFactory.createRole(this.role.code)
        : RoleFactory.createRole(this.role);
    else this.role = RoleFactory.createRole("comun");
    this.#error = "";
  }

  set firstName(firstName) {
    if (this.checkName(firstName)) this._firstName = firstName;
    else {
      throw new Error("Incorrect first name");
    }
  }

  set lastName(lastName) {
    if (this.checkName(lastName)) this._lastName = lastName;
    else {
      throw new Error("Incorrect last name");
    }
  }

  set username(username) {
    if (this.checkUsername(username)) this._username = username;
    else {
      throw new Error("Incorrect username");
    }
  }

  set email(email) {
    if (this.checkEmail(email)) this._email = email;
    else {
      throw new Error("Incorrect email");
    }
  }

  set password(password) {
    if (this.checkPassword(password)) this._password = password;
    else {
      throw new Error("Invalid password");
    }
  }

  set phone(phone) {
    if(this.checkPhone(phone)) this._phone = phone;
    else {
      throw new Error("Invalid phone");
    }
  }

  get phone() {
    return this._phone;
  }

  get firstName() {
    return this._firstName;
  }

  get lastName() {
    return this._lastName;
  }

  get username() {
    return this._username;
  }

  get email() {
    return this._email;
  }

  get password() {
    return this._password;
  }

  checkName(name) {
    return name != "" && name.match(new RegExp("^[A-Z][a-z]+$"));
  }

  checkUsername(username) {
    return username != "" && username.match(new RegExp("^[A-Za-z0-9#_./]+$"));
  }

  modifyData({
    id,
    username,
    firstName,
    lastName,
    email,
    password,
    birthDate,
    joinDate = Date.now(),
    phone,
    role = "comun",
    chat_color = "black",
    picture,
    token,
    confirmed = 0,
    tema = "light",
    tries = 0,
    first_try,
    last_try,
  }) {
    let old_id = this.id;
    for (let prop in arguments[0]) {
      if (arguments[0][prop] != null) {
        this[prop] = arguments[0][prop];
      }
    }
    console.log(arguments[0]);
    console.log(this);

    if (this.role)
      this.role = this.role.code
        ? RoleFactory.createRole(this.role.code)
        : RoleFactory.createRole(this.role);

    Users.findOne({
      where: {
        id: old_id,
      },
    })
      .then((user) => {
        if (!user) {
          throw new Error("Utilizatorul nu exista!");
        }
        user.update({
          username: this.username,
          nume: this.firstName,
          prenume: this.lastName,
          email: this.email,
          parola: arguments[0]["password"]
            ? User.encryptPassword(this.password)
            : this.password,
          data_nasterii: this.birthDate,
          data_inregistrarii: this.joinDate,
          culoare_chat: this.chat_color,
          rol: this.role.name,
          telefon: this.phone,
          imagine_profil: this.picture,
          token: this.token,
          confrmed: this.confirmed,
          tema: this.tema,
          tries: this.tries,
          first_try: this.first_try,
          last_try: this.last_try,
        });
      })
      .catch((error) => {
        throw error;
      });
    this.#error = "";
  }

  saveUser() {
    let token1 = Passwords.generateToken(50).toLowerCase();
    let token2 = String(Math.floor(this.joinDate.getTime() / 1000));
    console.log(token2);
    Users.create({
      id: this.id,
      username: this.username,
      nume: this.firstName,
      prenume: this.lastName,
      email: this.email,
      parola: User.encryptPassword(this.password),
      data_nasterii: this.birthDate,
      data_inregistrarii: this.joinDate,
      culoare_chat: this.chat_color,
      rol: this.role.name,
      telefon: this.phone,
      imagine_profil: this.picture,
      token: token1,
      confirmed: 0,
    }).then(() => {
      this.sendEmail(
        `Salut, stimate ${this.firstName + " " + this.lastName}!`,
        `Username-ul tau este ${this.username}`,
        `<h1>Salut!</h1>
            <p>Username-ul tau este ${this.username} pe site-ul <b><i><u>${User.domainName}</u></i></b></p>
            <p>Pentru a va verifica contul, va rugam sa accesati <a href='http://${User.domainName}/cod_mail/${token1}-${token2}/${this.username}' target="_blank">acest link</a>.</p>`
      );
    });
  }

  deleteUser() {
    Users.destroy({
      where: {
        id: this.id,
      },
    }).catch((error) => {
      throw new Error(
        `Nu s-a putut sterge utilizatorul ${this.username}! ${error}`
      );
    });
  }

  static getUserByUsername(username, obj, callback) {
    Users.findOne({
      where: {
        username: username,
      },
    })
      .then((userData) => {
        if (!userData) {
          callback(null, obj);
          return;
        }
        let user = new User({
          id: userData.id,
          username: userData.username,
          firstName: userData.prenume,
          lastName: userData.nume,
          email: userData.email,
          password: userData.parola,
          birthDate: userData.data_nasterii
            ? new Date(Date.parse(userData.data_nasterii))
            : null,
          joinDate: new Date(Date.parse(userData.data_inregistrarii)),
          phone: userData.telefon,
          role: userData.rol,
          chat_color: userData.culoare_chat,
          picture: userData.imagine_profil,
          token: userData.token,
          confirmed: userData.confirmed,
          tema: userData.tema,
          tries: userData.tries,
          first_try: userData.first_try
            ? new Date(Date.parse(userData.first_try))
            : null,
          last_try: userData.last_try
          ? new Date(Date.parse(userData.first_try))
          : null,
        });
        callback(user, obj);
      })
      .catch((error) => {
        throw error;
      });
  }

  static async getUserByUsernameAsync(username) {
    try {
      let userData = await Users.findOne({
        where: {
          username: username,
        },
      });
      if (!userData) {
        return null;
      }
      let user = new User({
        id: userData.id,
        username: userData.username,
        firstName: userData.prenume,
        lastName: userData.nume,
        email: userData.email,
        password: userData.parola,
        birthDate: userData.data_nasterii
          ? new Date(Date.parse(userData.data_nasterii))
          : null,
        joinDate: new Date(Date.parse(userData.data_inregistrarii)),
        phone: userData.telefon,
        role: userData.rol,
        chat_color: userData.culoare_chat,
        picture: userData.imagine_profil,
        token: userData.token,
        confrmed: userData.confirmed,
        tema: userData.tema,
        tries: userData.tries,
        first_try: userData.first_try
        ? new Date(Date.parse(userData.first_try))
        : null,
        last_try: userData.last_try
        ? new Date(Date.parse(userData.first_try))
        : null,
      });
      return user;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static search(
    {
      id,
      username,
      nume,
      prenume,
      email,
      parola,
      data_nasterii,
      data_inregistrarii = Date.now(),
      telefon,
      rol = "comun",
      chat_color = "black",
      imagine_profil,
    },
    callback
  ) {
    let query = {};
    for (let prop of arguments[0]) {
      if (prop !== null) {
        query[prop] = arguments[0][prop];
      }
    }
    Users.findAll({
      where: query,
    })
      .then((usersData) => {
        callback(
          null,
          usersData.map((userData) => {
            return new User({
              id: userData.id,
              username: userData.username,
              firstName: userData.prenume,
              lastName: userData.nume,
              email: userData.email,
              password: userData.parola,
              birthDate: userData.data_nasterii
                ? new Date(Date.parse(userData.data_nasterii))
                : null,
              joinDate: new Date(Date.parse(userData.data_inregistrarii)),
              phone: userData.telefon,
              role: userData.rol,
              chat_color: userData.culoare_chat,
              picture: userData.imagine_profil,
              token: userData.token,
              confrmed: userData.confirmed,
              tema: userData.tema,
              tries: userData.tries,
              first_try: userData.first_try
              ? new Date(Date.parse(userData.first_try))
              : null,
              last_try: userData.last_try
              ? new Date(Date.parse(userData.first_try))
              : null,
            });
          })
        );
      })
      .catch((error) => {
        callback(error, []);
      });
  }

  static async searchAsync({
    id,
    username,
    nume,
    prenume,
    email,
    parola,
    data_nasterii,
    data_inregistrarii = Date.now(),
    telefon,
    rol = "comun",
    chat_color = "black",
    imagine_profil,
  }) {
    let query = {};
    for (let prop of arguments[0]) {
      if (prop !== null) {
        query[prop] = arguments[0][prop];
      }
    }
    let usersData = await Users.findAll({
      where: query,
    });
    return usersData.map((userData) => {
      return new User({
        id: userData.id,
        username: userData.username,
        firstName: userData.prenume,
        lastName: userData.nume,
        email: userData.email,
        password: userData.parola,
        birthDate: userData.data_nasterii
          ? new Date(Date.parse(userData.data_nasterii))
          : null,
        joinDate: new Date(Date.parse(userData.data_inregistrarii)),
        phone: userData.telefon,
        role: userData.rol,
        chat_color: userData.culoare_chat,
        picture: userData.imagine_profil,
        token: userData.token,
        confrmed: userData.confirmed,
        tema: userData.tema,
        tries: userData.tries,
        first_try: userData.first_try
        ? new Date(Date.parse(userData.first_try))
        : null,
        last_try: userData.last_try
        ? new Date(Date.parse(userData.first_try))
        : null,
      });
    });
  }

  hasPerms(perm) {
    return this.role.hasPerms(perm);
  }

  confirmEmail() {
    Users.findOne({
      where: {
        id: this.id,
      },
    }).then((user) => {
      if (!user) {
        throw new Error("User not found");
      }
      user.update({
        confirmed: 1,
      });
    });
  }

  async sendEmail(subject, textMsg, htmlMsg, attach = []) {
    let transport = nodemailer.createTransport(emailConfig);
    await transport.sendMail({
      from: emailConfig.auth.user,
      to: this.email,
      subject: subject,
      text: textMsg,
      html: htmlMsg,
      attachments: attach,
    });
    console.log(`Sent email to ${this.email}`);
  }

  checkEmail(email) {
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  }

  checkPassword(password) {
    return password.length >= 6;
  }

  checkPhone(phone) {
    if(phone === null || phone === "") return true;
    const phoneRegex = /^\+?[0][0-9]{9,}$/;
    return phoneRegex.test(phone) && phone.length > 0;
  }

  static encryptPassword(password) {
    return crypto
      .scryptSync(password, User.passwordEncryption, User.codeLength)
      .toString("hex");
  }
}

module.exports = User;
