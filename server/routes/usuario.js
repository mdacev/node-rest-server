
const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const app = express();

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

app.get('/usuario', verificaToken, (req, res) => {
   
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 12;
    limite = Number(limite);

    //Paginado

    Usuario.find({ status:true }, 'username email img role status google')
        .skip(desde)
        .limit(limite)
        .exec( (err, usuarios) => {

            if( err ){
                return res.status(400).json({
                    ok: false,
                    err 
                });
            }
            
            //Cantidad total de registros.
            Usuario.countDocuments({ status:true }, (err, total) => {

                    res.json({
                    ok: true,
                    usuarios,
                    total
                });
            })
            

        });
});

app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {

    let body = req.body;

    console.log('POST  => ',body)
    let usuario = new Usuario({

        username: body.username,
        email: body.email,
        password: bcrypt.hashSync( body.password , 10 ),
        role: body.role
    });

    usuario.save( (err, usuarioDB) => {

        if( err ){
            return res.status(400).json({
                ok: false,
                err 
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });


});

app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    //underscore - para validar que campos se pueden actualizar.
    let _body = _.pick( body, ['username' , 'email', 'role', 'img', 'status', 'google']);

    console.log(_body+'\n'+id);

    Usuario.findByIdAndUpdate( id, _body, {new:true, runValidators: true}, (err, usuarioDB) => {

        if( err ){
            return res.status(400).json({
                ok: false,
                err 
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
    
    let id = req.params.id;

    //Borrado fisico
    //Usuario.findByIdAndDelete(id, (err, usuarioDB) => {

    //Borrado logico
    Usuario.findByIdAndUpdate(id, {status:false}, {new:true}, (err, usuarioDB) => {

        if( err ){
            return res.status(400).json({
                ok: false,
                err 
            });
        }
        if( !usuarioDB ){
            return res.status(400).json({
                ok: false,
                err : {
                    mesagge: 'Usuario no encontrado.'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

module.exports = app;