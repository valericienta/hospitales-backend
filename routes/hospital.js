var express = require('express');
var app = express();


var mdAutenticacion = require('../middleware/auth')
var Hospital = require('../models/hospital');

// =====================================
//  
// =====================================
app.get('/', (request, response) => {

    let desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital
        .find({})
        .skip(desde)
        .limit(5)
        .exec((error, hospitales) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: error
                })
            }

            Hospital.count({}, (error, total) => {
                response.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: total
                })
            })
        })
});

// =====================================
//  CREAR HOSPITALES
// =====================================
app.post('/', mdAutenticacion.verificaToken, (req, response) => {
    var body = req.body;

    var nuevoHospital = new Hospital({
        nombre: body.nombre,
        img: '',
        usuario: req.usuario._id
    })

    nuevoHospital.save((error, hospital) => {
        if (error)
            return response.status(500).json({
                ok: true,
                mensaje: 'Error BD al crear hospital',
                errors: error
            })
        return response.status(200).json({
            ok: true,
            mensaje: 'Se ha creado el hospital',
            hospital: hospital
        })
    })
});
// =====================================
//  Actualizar datos de hospital
// =====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, response) => {
    let id = req.params.id;
    let body = req.body;

    Hospital.findById(id, (error, hospital) => {

        if (error)
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: error
            });

        if (!hospital)
            return response.status(400).json({
                ok: false,
                mensaje: `El hospital con el id  ${id}no existe`,
                errors: { message: 'No existe un hospital con el id ingresado' }
            });

        hospital.nombre = body.nombre;

        hospital.save((error, hospitalGuardado) => {
            if (error)
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: error
                });

            response.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            })
        })
    })

});
// =====================================
// Borrar usario por id
// =====================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, response) => {
    let id = req.params.id;
    Hospital.findByIdAndRemove(id, (error, hospitalEliminado) => {
        if (error)
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el hospital',
                errors: error
            });
        if (!hospitalEliminado)
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe ningun hospital con ese id ',
                errors: error
            });
        response.status(200).json({
            ok: true,
            hospital: hospitalEliminado
        })
    })
})


// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + '  no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
})

module.exports = app;