const express = require('express');

const fileUpload = require('express-fileupload');
var fs = require('fs');
const app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion 
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            error: { message: 'Tipo de coleccion no valida' }

        });
    }

    if (!req.files) { // se pregunta si viene un archivo sino se lanza un error
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            error: { message: 'Debe seleccionar una imagen' }

        });
    }
    //Obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var ext = nombreCortado[nombreCortado.length - 1];

    //solo se aceptan estas extensiones

    var extValidas = ['png', 'PNG', 'jpg', 'gif', 'jpeg'];

    if (extValidas.indexOf(ext) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension invalida',
            error: { message: 'Extensiones validas son png, jpg, gif, jpeg' }

        });
    }

    // crear nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ ext }`;


    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                error: { message: 'Error al mover el archivo' }

            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });


});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe'

                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
                //fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            })

        });

    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'medico no existe'

                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;

            // si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
                //fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    usuario: medicoActualizado
                });
            })

        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'hospital no existe'

                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;

            // si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
                //fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    usuario: hospitalActualizado
                });
            })

        });
    }
}


module.exports = app;