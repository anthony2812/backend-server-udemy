const express = require('express');
const bcrypt = require('bcryptjs');
var middlewareAuth = require('../middlewares/autenticacion');
const app = express();

var Usuario = require('../models/usuario');

//===================================
// Obtener todos los usuarios
//===================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // si viene un parametro en la url haz esto req.query.desde sino || 0
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                } else {

                    Usuario.count({}, (err, conteo) => { // esto es para contar los resultados
                        res.status(200).json({
                            ok: true,
                            usuarios: usuarios,
                            total: conteo
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

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id' + id + 'no existe',
                errors: { message: 'no existe un usuario con ese id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuarios',
                    errors: err
                });
            }

            usuarioGuardado.password = "(:";

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: req.usuario

            });
        });

    });
});



//===================================
// crear un nuevo usuario
//===================================
app.post('/', middlewareAuth.verificaToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuario({ // este ususario viene del modelo/ usuario.js
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });


});

//===================================
// eliminar un  usuario
//===================================
app.delete('/:id', middlewareAuth.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un usuario con ese id',
                errors: { message: 'no existe un usuario con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario
        });
    });
});

module.exports = app;