var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var Usuario = require('../models/usuario');

var SEED = require('../config/config').SEED;

// GOOGLE 
const { OAuth2Client } = require('google-auth-library');
var CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// =====================================
//  AUTENTICACION GOOGLE
// =====================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, response) => {
    let token = req.body.token;
    let googleUser = await verify(token)
        .catch(error => {
            return response.status(403).json({
                ok: false,
                mensaje: 'Token no válido ',
                errors: JSON.stringify(error)
            });

        })
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err)
            return response.status(400).json({
                ok: false,
                mensaje: 'Error de base de datos',
                errors: err
            });
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar sus credencial (usuario/pwd)',

                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 1400 });
                response.status(200).json({
                    ok: true,
                    mensaje: 'Login post correcto',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id,
                    menu: obtenerMenu(usuarioDB.role)
                })
            }
        } else {
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.password = ':)';
            usuario.google = true;
            usuario.role = 'USER_ROLE'
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'No se pudo grabar',
                        errors: err
                    });
                }
                response.status(200).json({
                    ok: true,
                    mensaje: 'Login post correcto',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id,
                    menu: obtenerMenu(usuarioDB.role)
                })
            })
        }
    })
})

// =====================================
//  AUTENTICACION BD
// =====================================   
app.post('/', (req, response) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: error
            });
        }
        if (!usuarioDB)
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: error
            });

        if (!bcrypt.compareSync(body.password, usuarioDB.password))
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: error
            });

        // =====================================
        //  CREAR TOKEN
        // =====================================
        usuarioDB.password = '';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 1400 });

        response.status(200).json({
            ok: true,
            mensaje: 'Login post correcto',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id,
            menu: obtenerMenu(usuarioDB.role)
        })
    })

});

function obtenerMenu(ROLE) {
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJs', url: '/rxjs' },
            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' },

            ]
        }
    ];
    if (ROLE == 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuario' })
    }
    return menu;

}
module.exports = app;