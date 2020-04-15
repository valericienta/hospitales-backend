var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var fs = require('fs');

app.put('/:tipo/:id', (request, response) => {
    var tipo = request.params.tipo;
    var tiposValidos = ['medicos', 'hospitales', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            message: 'El tipo no es válido',
            errors: { message: 'Solo se admiten los siguientes tipos ' + tiposValidos.join(', ') }
        })
    }

    var id = request.params.id;
    if (!request.files || Object.keys(request.files).length === 0) {
        return response.status(400).json({
            ok: false,
            message: 'No ha subido ningún archivo',
            errors: { message: 'Debe subir al menos un archivo' }
        })
    }

    let archivo = request.files.imagen;
    var nombreCortado = archivo.name.split('.');

    var extension = nombreCortado[nombreCortado.length - 1];
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return response.status(500).json({
            ok: false,
            message: 'Debe subir una imagen',
            errors: { message: 'Solo se admiten extensiones ' + extensionesValidas.join(', ') }
        })
    }
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    var path = `./uploads/${tipo}/${nombreArchivo}`

    archivo.mv(path, err => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Hubo un error al subir el archivo',
                errors: { message: '' + JSON.stringify(err) }
            })
        }
        subirPorTipo(tipo, id, nombreArchivo, response);
    })

});

function subirPorTipo(tipo, id, nombreArchivo, response) {
    if (tipo == 'usuarios') {
        Usuario.findById(id, (errorFind, usuario) => {
            if (errorFind)
                return response.status(500).json({
                    ok: false,
                    message: 'Error al buscar usuario',
                    errors: { message: JSON.stringify(errorFind) }
                });

            if (usuario.img) {
                var path_viejo = './uploads/usuarios/' + usuario.img;
                if (fs.existsSync(path_viejo))
                    fs.unlinkSync(path_viejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((errorActualizacion, usuarioActualizado) => {
                if (errorActualizacion)
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al actualizar usuario',
                        errors: { message: JSON.stringify(errorActualizacion) }
                    })
                return response.status(200).json({
                    ok: true,
                    mensaje: `Imagen de ${tipo} actualizada ${path_viejo}`,
                    usuario: usuarioActualizado
                });
            })
        })
    }
    if (tipo == 'hospitales') {
        Hospital.findById(id, (errorFind, hospital) => {
            if (errorFind)
                return response.status(500).json({
                    ok: false,
                    message: 'Error al buscar usuario',
                    errors: { message: JSON.stringify(errorFind) }
                })
            var path_viejo = './uploads/hospitales/' + hospital.img;

            if (hospital.img != '')
                if (fs.existsSync(path_viejo)) fs.unlinkSync(path_viejo);
            hospital.img = nombreArchivo;
            hospital.save((errorActualizacion, hospitalActualizado) => {
                if (errorActualizacion) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al actualizar usuario',
                        errors: { message: JSON.stringify(errorActualizacion) }
                    })
                }
                return response.status(200).json({
                    ok: true,
                    mensaje: `Imagen de ${tipo} actualizada`,
                    hospital: hospitalActualizado
                });
            })
        })
    }
    if (tipo == 'medicos') {
        Medico.findById(id, (errorFind, medico) => {
            if (errorFind)
                return response.status(500).json({
                    ok: false,
                    message: 'Error al buscar medico',
                    errors: { message: JSON.stringify(errorFind) }
                })

            if (medico.img != '') {
                var path_viejo = './uploads/medicos/' + medico.img;
                if (fs.existsSync(path_viejo)) fs.unlinkSync(path_viejo);
            }

            medico.img = nombreArchivo;
            medico.save((errorActualizacion, medicoActualizado) => {
                if (errorActualizacion) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al actualizar medico',
                        errors: { message: JSON.stringify(errorActualizacion) }
                    })
                }
                return response.status(200).json({
                    ok: true,
                    mensaje: `Imagen de ${tipo} actualizada`,
                    medico: medicoActualizado
                });
            })


        })
    }

}

module.exports = app;