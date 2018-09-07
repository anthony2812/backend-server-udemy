//requires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//inicializar variables
const app = express();


//Body Parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

//Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
//Rutas
app.use('/usuario', usuarioRoutes); // en realidad esto es un middleware
app.use('/login', loginRoutes); // en realidad esto es un middleware
app.use('/', appRoutes); // en realidad esto es un middleware



//escuchar peticiones
app.listen(3000, () => {
    console.log('Servidor: \x1b[32m%s\x1b[0m', 'online');
});