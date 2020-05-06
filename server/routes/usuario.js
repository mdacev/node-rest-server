
const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const app = express();

const Usuario = require('../models/usuario');

app.get('/usuario', function(req, res) {
   
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 11;
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
            Usuario.count({ status:true }, (err, total) => {

                    res.json({
                    ok: true,
                    usuarios,
                    total
                });
            })
            

        });
});

app.post('/usuario', function(req, res) {

    let body = req.body;

    let usuario = new Usuario({

        username: 'mariano',//body.username,
        email: 'm@m.com',//body.email,
        password: bcrypt.hashSync( '1234' , 10 ),//body.password,
        role: 'ADMIN_ROLE'//body.role
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

app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;
    let body = {

        username: 'marianodddd',//body.username,
        email: 'mariano@mar.com',//body.email,
        password: bcrypt.hashSync( '123456' , 10 ),//body.password,
        role: 'ADMIN_ROLE',//body.role
    };//req.body;

    //underscore - para validar que campos se pueden actualizar.
    let _body = _.pick( req.body, ['username' , 'email', 'role', 'img', 'status']);

    //console.log(_body);

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

app.delete('/usuario/:id', function(req, res) {
    
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