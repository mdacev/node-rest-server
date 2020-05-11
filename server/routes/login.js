
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();

const Usuario = require('../models/usuario');



app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne( {email:body.email} , (err, usuarioDB) =>{

        if( err ){
            return res.status(500).json({
                ok: false,
                err 
            });
        }

        if( !usuarioDB || !bcrypt.compareSync( body.password, usuarioDB.password) ){
            return res.status(400).json({
                ok: false,
                err:{
                    message:'Usuario y/o Contraseña incorrecto.'
                }
            });
        }

        let token = jwt.sign( {usuarioDB}, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});
        res.json({
            ok: true,
            usuarioDB,
            token
        });

    } );
   

});

//Google congig.

async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    
    return {
        username: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
  

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify( token )
                .catch( e => {
                    return res.status(403).json(
                        {
                            ok: false,
                            err: e
                        }
                    );
                });
    

    Usuario.findOne( {email: googleUser.email}, (err, usuarioDB) => {

            //Error
            if(err){
                return res.status(500).json(
                    {
                        ok: false,
                        err
                    }
                );
            }
            //Si es usuario ya esta registrado por la app.
            if( usuarioDB ){
                if( !usuarioDB.google ){
                    return res.status(400).json({
                        ok: false,
                        err:{
                            message:'Debe usar su autenticación de la App..'
                        }
                    });
                }
                //Si no le actualizo el token
                else{
                    let token = jwt.sign( {usuarioDB}, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});
                    return res.json({
                        ok: true,
                        usuarioDB,
                        token
                    });
                }
            }
            //Si el usuario no existe...lo creo
            else{

                let usuario = new Usuario();
                usuario.username = googleUser.username;
                usuario.email = googleUser.email;
                usuario.img = googleUser.picture;
                usuario.google = true;
                usuario.password = bcrypt.hashSync( 'GENERICO' , 10 );

                usuario.save( (err, usuarioDB) => {

                    if(err){
                        return res.status(500).json(
                            {
                                ok: false,
                                err
                            }
                        );
                    }

                    let token = jwt.sign( {usuarioDB}, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});
                    return res.json({
                        ok: true,
                        usuarioDB,
                        token
                    });

                });
            }
            
    });


});





module.exports = app;