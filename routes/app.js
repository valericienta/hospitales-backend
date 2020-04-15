var express = require('express');
var app = express();


app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'petición realizada correctamente'
    })
})

module.exports = app;

// mongod.exe --dbpath="D:\MongoDB\data\db"