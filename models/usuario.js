var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}
var usuarioSchema = mongoose.Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El email es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: false, default: 'USER_ROLE ', enum: rolesValidos },
    google: { type: Boolean, default: false },
});

usuarioSchema.plugin(uniqueValidator, { message: 'El correo ingresado ya se encuentra registrado' });
module.exports = mongoose.model('Usuario', usuarioSchema);