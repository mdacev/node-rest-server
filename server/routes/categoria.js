
const express = require('express');

const app = express();

const Categoria = require('../models/categoria');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const _ = require('underscore');

//Traer todas
app.get('/categoria', verificaToken, async (req, res) => {

    await Categoria.find({ })
        
        .sort('descripcion')
        // schema relacional , propiedades.
        .populate( 'usuario',  'username email')
        .exec( (err, categoriasDB) => {

            if( err ){
                return res.status(400).json({
                    ok: false,
                    err 
                });
            }
            //Cantidad total de registros.
            Categoria.countDocuments({ }, (err, total) => {

                    res.json({
                    ok: true,
                    categorias: categoriasDB,
                    total
                });
            })
            

        });
});

//Traer una por _id
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

//Crear categoria
app.post('/categoria', verificaToken, (req, res) => {
    
    let body = req.body;
    let usuario_id_ref = req.usuario.usuarioDB._id;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: usuario_id_ref
    });


    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    });


});

//Actualizar categoria
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    //underscore - para validar que campos se pueden actualizar.
    let _body = _.pick( body, ['descripcion']);

    console.log(_body+'\n'+id);

    Categoria.findByIdAndUpdate( id, _body, {new:true, runValidators: true}, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//Borrar categoria fisicamente por usuario administrador
app.delete('/categoria/:id', [verificaToken, verificaAdminRole] , (req, res) => {
    
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {

        if( err ){
            return res.status(500).json({
                ok: false,
                err 
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err:{
                    message:'Categoria no encontrada.'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria ' + categoriaDB.descripcion + ' borrada.'
        });
    });
});

module.exports = app;