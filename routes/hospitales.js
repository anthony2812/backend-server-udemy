const express = require('express');
const bcrypt = require('bcryptjs');
var middlewareAuth = require('../middlewares/autenticacion');
const app = express();

var Hospital = require('../models/hospital');

//===================================
// Obtener todos los hospitales
//===================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0; // si viene un parametro en la url haz esto req.query.desde sino || 0
    desde = Number(desde);
    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email') //OJO este campo usuario es del json q retorna y como esta asociado a la coleccion de usuarios trae automaticamente los datos de ella
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                } else {

                    Hospital.count({}, (err, conteo) => { // esto es para contar los resultados
                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
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

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id' + id + 'no existe',
                errors: { message: 'no existe un hospital con ese id' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;


        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospitales',
                    errors: err
                });
            }



            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,

            });
        });

    });
});

//===================================
// crear un nuevo usuario
//===================================
app.post('/', middlewareAuth.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({ // este hospital viene del modelo/ hospital.js
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Hospital',
                errors: err
            });
        }
        hospitalGuardado.id = req.usuario;
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });


});
//===================================
// eliminar un  usuario
//===================================
app.delete('/:id', middlewareAuth.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un hospital con ese id',
                errors: { message: 'no existe un hospital con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
        });
    });
});

module.exports = app;