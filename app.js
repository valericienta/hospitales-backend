// Requires 
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

// inicializar variables
var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    next();
});

// conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error) => {
    if (error) throw error;
    console.log('Base de datos \x1b[32m%s\x1b[0m', 'online');
});

var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Importamos Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var updloadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
// escuchar peticiones
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', updloadRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/', appRoutes);


app.listen(3000, () => {
    console.log('Express Server puerto 3000 \x1b[32m%s\x1b[0m', 'online');
})