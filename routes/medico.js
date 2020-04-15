var express = require('express');
var app = express();

var mdAutenticacion = require('../middleware/auth')
var Medico = require('../models/medico');


// =====================================
//  BUSCANDO USUARIO SIN VALIDAR TOKEN
// =====================================
app.get('/', (request, response) => {

    let desde = request.query.desde || 0;
    desde = Number(desde);

    Medico
        .find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre ')
        .exec((error, medico) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: error
                })
            }

            Medico.count({}, (error, total) => {
                response.status(200).json({
                    ok: true,
                    medicos: medico,
                    total: total
                })
            })

        })
});


// =====================================
//  Crear  Medico
// =====================================
app.post('/', mdAutenticacion.verificaToken, (req, response) => {
    var body = req.body;

    var nuevoMedico = new Medico({
        nombre: body.nombre,
        img: '',
        usuario: req.usuario._id,
        hospital: body.hospital
    })

    nuevoMedico.save((error, medico) => {
            if (error)
                return response.status(500).json({
                    ok: true,
                    mensaje: 'Error BD al crear Medico',
                    errors: error
                })
            return response.status(200).json({
                ok: true,
                mensaje: 'Se ha creado el Medico',
                medico: medico
            })
        })
        // })


});

// =====================================
//  Actualizar datos de Medico
// =====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, response) => {
    let id = req.params.id;
    let body = req.body;

    Medico.findById(id, (error, medico) => {

        if (error)
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Medico',
                errors: error
            });

        if (!medico)
            return response.status(400).json({
                ok: false,
                mensaje: `El Medico con el id  ${id} no existe`,
                errors: { message: 'No existe un Medico con el id ingresado' }
            });

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.save((error, MedicoGuardado) => {
            if (error)
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el Medico',
                    errors: error
                });

            response.status(200).json({
                ok: true,
                Medico: MedicoGuardado
            })
        })
    })

});
// =====================================
// Borrar usario por id
// =====================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, response) => {
    let id = req.params.id;
    Medico.findByIdAndRemove(id, (error, medicoEliminado) => {
        if (error)
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el Medico',
                errors: error
            });
        if (!medicoEliminado)
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe ningun Medico con ese id ',
                errors: error
            });
        response.status(200).json({
            ok: true,
            medico: medicoEliminado
        })
    })
})

// ==========================================
// Obtener Medico por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Medico.findById(id)
        .populate('usuario', 'nombre img email')
        .populate('hospital', 'nombre img')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + '  no existe',
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                medico: medico
            });
        })
})


module.exports = app;