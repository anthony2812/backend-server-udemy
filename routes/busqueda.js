const express = require('express');
const app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


//===================================
// Busqueda por coleccion
//===================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuario(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:

            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales ',
                error: { message: 'Tipo de tabla/coleccion no valido' }
            });

    }
    promesa.then(data => {
            res.status(200).json({
                ok: true,
                [tabla]: data // con los corchetes le estoy diciendo a javascript q lo q quiero es el valor de tabla 
            });
        }

    );
});


//===================================
// Busqueda general
//===================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuario(busqueda, regex)
        ])
        .then(respuesta => {
            res.status(200).json({
                ok: true,
                hospitales: respuesta[0], // esto es el orden de como se ejecutan los promises xq arriba  en promises.all declaramos como un arreglo
                medicos: respuesta[1],
                usuarios: respuesta[2]
            });
        });

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex }, (err, hospitales) => {
            if (err) {
                reject('Error al cargar hospitales', err);
            } else {
                resolve(hospitales);
            }
        });
    });


}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex }, (err, medicos) => {
            if (err) {
                reject('Error al cargar Medicos', err);
            } else {
                resolve(medicos);
            }
        });
    });


}

function buscarUsuario(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            })
    });


}

module.exports = app;