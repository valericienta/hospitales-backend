var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middleware/auth')
var Usuario = require('../models/usuario');
// =====================================
// Obtener todos los usuarios
// =====================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }
                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                })
            });
});

// =====================================
// Crear un nuevo usuario
// =====================================
app.post('/', (req, response) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
        google: body.google
    })

    usuario.save((error, usuarioGuardado) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: error
            });

        }
        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        })
    })
})


// =====================================
// Actualizar usuario  
// =====================================

app.put('/:id', [mdAutenticacion.verificaToken], (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });
});
// =====================================
// Borrar usario por id
// =====================================

app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdminOrUser], (req, response) => {
    let id = req.params.id;
    Usuario.findByIdAndRemove(id, (error, usuarioEliminado) => {
        if (error)
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el usuario',
                errors: error
            });
        if (!usuarioEliminado)
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe ningun usuario con ese id ',
                errors: error
            });
        response.status(200).json({
            ok: true,
            usuario: usuarioEliminado
        })
    })
})
module.exports = app;