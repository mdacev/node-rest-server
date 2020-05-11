require('./config/config');

const express = require('express');
const app = express();

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const colors = require('colors');
const path = require('path');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// habilitar la carpeta public
app.use( express.static( path.resolve( __dirname , '../public' ) ) );

// parse application/json
app.use(bodyParser.json())

//Routes
app.use( require( './routes/index') ); 

//coneccion
mongoose.connect(process.env.URLBD, 
        { useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology:true }
        ,(err , res) => {

            if(err) throw err;

        console.log(colors.random('Base d Datos ONLINE!'));
});

app.listen(process.env.PORT, () => {
    console.log(colors.yellow('================================'));
    console.log(colors.green('=== Escuchando puerto: ', process.env.PORT, '==='));
    console.log(colors.yellow('================================'));
});