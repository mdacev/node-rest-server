const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

//importar schema
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');


app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id', (req, res) => {

        let tipo = req.params.tipo;
        let id = req.params.id;


        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json(
                        {
                            ok:false,
                            err:{
                                message: 'No hay archivos para cargar.'
                            }
                        });
        }

        /**form-data */
        let archivo = req.files.archivo;
        let archivoProp = archivo.name.split('.');
        let extension = archivoProp[archivoProp.length-1];

        //tipos validas
        let tiposValidos = ['usuarios', 'productos'];

        if( tiposValidos.indexOf(tipo) < 0){
            return res.status(400).json({
                ok: false,
                err:{
                    message:'Tipos permitidos: '+ tiposValidos.join(' - ')
                }
            })
        }

        //extensiones validas
        let extensionesValidas = ['jpg', 'jpeg', 'png', 'gif'];

        if( extensionesValidas.indexOf(extension) < 0){
            return res.status(400).json({
                ok: false,
                err:{
                    message:'Extensiones permitidas: '+ extensionesValidas.join(' - ')
                }
            })
        }

        //Cambiar nombre de archivo.
        let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

        archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
            if (err)
              return res.status(500).json({
                  ok: false,
                  err
              });
        
            // Aqui, imagen cargada
            if (tipo === 'usuarios') {
                imagenUsuario(id, res, nombreArchivo);
            } else {
                imagenProducto(id, res, nombreArchivo);
            }

        });
});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {

            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuaro no existe'
                }
            });
        }

        borraArchivo(usuarioDB.img, 'usuarios')

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });

        });


    });


}



function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {

            borraArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'el producto no existe'
                }
            });
        }

        console.log(productoDB.img);
        borraArchivo(productoDB.img, 'productos')

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });

        });


    });


}



function borraArchivo(nombreImagen, tipo) {

    //si existe la imagen la borra...y la reemplaza x la nueva.
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }


}

module.exports = app;