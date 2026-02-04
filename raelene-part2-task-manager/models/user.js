class User{
    constructor(name, email, password, confirmPassword){
        this.name = name;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;

        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        this.id = timestamp + ""+ random.toString().padStart(3, '0');  
    }
}

module.exports = {User};