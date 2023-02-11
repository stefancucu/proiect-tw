const Perms = require('./permissions.js');

class Role{
    static get name() {return "generic"}
    static get perms() {return []}
    constructor (){
        this.code=this.constructor.name;
    }

    hasPerms(perm){ 
        return this.constructor.perms.includes(perm);
    }
}

class RoleAdmin extends Role{
    
    static get name() {return "admin"}
    constructor (){
        super();
    }

    hasPerms(){
        return true; 
    }
}

class RoleModerator extends Role{
    
    static get name() {return "moderator"}
    static get rights() { return [
        Perms.viewUsers,
        Perms.deleteUsers
    ] }
    constructor (){
        super()
    }
}

class RoleClient extends Role{
    static get name() {return "comun"}
    static get rights() { return [
        Perms.buyProducts,
        Perms.viewProducts
    ] }
    constructor (){
        super()
    }
}

class RoleFactory{
    static createRole(name) {
        switch(name){
            case RoleAdmin.name : return new RoleAdmin();
            case RoleModerator.name : return new RoleModerator();
            case RoleClient.name : return new RoleClient();
        }
    }
}


module.exports={
    RoleFactory:RoleFactory,
    RoleAdmin:RoleAdmin
}