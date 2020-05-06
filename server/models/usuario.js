const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');

let validRole = {
    values: ['USER_ROLE' , 'ADMIN_ROLE'],
    message: '{VALUE} no es un rol válido.'
}

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({

    username:{
        type: String,
        required: [true , 'username es requerido'],
        unique: true
    },
    email:{
        type: String,
        required: [true , 'email es requerido'],
        unique: true
    },
    password:{
        type: String,
        required: [true , 'password es requerida']
    },
    img:{
        type: String,
        required: false
    },
    role:{
        type: String,
        default: 'USER_ROLE',
        enum: validRole
    },
    status:{
        type: Boolean,
        default: true
       
    },
    google:{
        type: Boolean,
        default: true
        
    }

});

//Metodos
//-Para no devolver la password al front

usuarioSchema.methods.toJSON = function() {
    let u = this;
    let uObject = u.toObject();
    delete uObject.password;

    return uObject;
} 

//Validación registro único
usuarioSchema.plugin( mongooseUniqueValidator , {message: '{PATH} debe ser único'} );

module.exports = mongoose.model( 'Usuario' , usuarioSchema );