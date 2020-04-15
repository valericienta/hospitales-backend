var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// =====================================
//  Verificar Token
// =====================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                ok: false,
                mensaje: 'No autorizado',
                errors: error
            });
        }
        req.usuario = decoded.usuario;
        next();
    })
};

// =====================================
//  Verificar ADMIN
// =====================================
exports.verificaAdmin = function(req, res, next) {
    var usuario = req.usuario;
    if (usuario.role == 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'No es administrador'
        });
    }

};

// =====================================
//  Verificar ADMIN o SAME USER
// =====================================
exports.verificaAdminOrUser = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;
    if (usuario.role == 'ADMIN_ROLE' || usuario._id == id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: `Usuario actual: ${usuario} Usuario enviado: ${id}`

        });
    }

};