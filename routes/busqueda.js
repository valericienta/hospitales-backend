var express = require('express');
var app = express();

// =====================================
//  MODELOS
// =====================================
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
// =====================================
//  BUSQUEDA POR COLECCION
// =====================================
app.get('/coleccion/:tabla/:busqueda', (request, response) => {
        let tabla = request.params.tabla;
        let busqueda = request.params.busqueda;
        var promesa;
        if (tabla == 'medicos') promesa = buscarMedicos(new RegExp(busqueda, 'i'));
        if (tabla == 'hospitales') promesa = buscarHospital(new RegExp(busqueda, 'i'));
        if (tabla == 'usuarios') promesa = buscarUsuarios(new RegExp(busqueda, 'i'));
        promesa.then(data => {
                response.status(200).json({
                    ok: true,
                    [tabla]: data
                })
            })
            // promesa.then(data => {
            //     response.status(200).json({
            //         ok: true,
            //         [tabla]: data
            //     })
            // })


    })
    // =====================================
    //  BUSQUEDA GENERAL
    // =====================================
app.get('/todo/:busqueda', (request, response, next) => {
    let busqueda = request.params.busqueda;
    var regex = new RegExp(busqueda, 'i') //{ nombre: /a/i })

    Promise.all([
            buscarHospitales(regex),
            buscarMedicos(regex),
            buscarUsuarios(regex)
        ])
        .then(respuestas => {
            response.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            })
        })

});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital
            .find({})
            .or([{ nombre: regex }, { email: regex }])
            .exec((error, medicos) => {
                if (error) reject(error)
                else resolve(medicos)
            })
    })
}


function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico
            .find()
            .or([{ nombre: regex }, { email: regex }])
            .populate('usuario', 'nombre img')
            .populate('hospital', 'nombre ')
            .exec((error, usuarios) => {
                if (error) reject(error)
                else resolve(usuarios)
            })
    })
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario
            .find({}, 'nombre email img')
            .or([{ nombre: regex }, { email: regex }])
            .exec((error, medicos) => {
                if (error) reject(error)
                else resolve(medicos)
            })
    })
}

module.exports = app;