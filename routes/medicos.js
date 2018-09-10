const express = require('express');
const bcrypt = require('bcryptjs');
var middlewareAuth = require('../middlewares/autenticacion');
const app = express();

var Medico = require('../models/medico');

//===================================
// Obtener todos los hospitales
//===================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0; // si viene un parametro en la url haz esto req.query.desde sino || 0
    desde = Number(desde);
    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                } else {

                    Medico.count({}, (err, conteo) => { // esto es para contar los resultados
                        res.status(200).json({
                            ok: true,
                            medicos: medicos,
                            Total: conteo
                        });
                    })

                }

            })



});
//===================================
// actualizar un nuevo usuario
//===================================
app.put('/:id', middlewareAuth.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medicos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un medico',
                errors: err
            });
        }

        if (!medicos) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id' + id + 'no existe',
                errors: { message: 'no existe un hospital con ese id' }
            });
        }

        medicos.nombre = body.nombre;
        medicos.usuario = req.usuario._id;
        medicos.hospital = body.hospital;


        medicos.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Medico',
                    errors: err
                });
            }



            res.status(200).json({
                ok: true,
                Medico: medicoGuardado,
            });
        });

    });
});

//===================================
// crear un nuevo usuario
//===================================
app.post('/', middlewareAuth.verificaToken, (req, res) => {
    var body = req.body;

    var medicos = new Medico({ // este hospital viene del modelo/ hospital.js
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medicos.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Medicos',
                errors: err
            });
        }
        medicoGuardado.id = req.usuario;
        res.status(201).json({
            ok: true,
            Medico: medicoGuardado,
        });
    });


});
//===================================
// eliminar un  usuario
//===================================
app.delete('/:id', middlewareAuth.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un medico con ese id',
                errors: { message: 'no existe un medico con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: medicoBorrado,
        });
    });
});

module.exports = app;