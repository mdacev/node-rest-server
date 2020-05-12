const jwt = require('jsonwebtoken');

//Vericar token
let verificaToken = ( req, res, next) => {

    let token = req.get('token');
    
    jwt.verify( token, process.env.SEED, (err, decoded) => {

        if( err ){
            return res.status(401).json({
                ok: false,
                err:{
                    message: err +' Token no valido.'
                }
            });
        }

        req.usuario = decoded;
    });

    next();


}

//Vericar que sea administrador
let verificaAdminRole = ( req, res, next) => {

    let usuario = req.usuario.usuarioDB;
    if( usuario.role === 'ADMIN_ROLE' ){
        next();
    }
    else{
        res.json({
            ok: false,
            err:{
                message: 'El usuario no es Administrador.'
            }
        });
    }

}

module.exports = {
    verificaToken,
    verificaAdminRole
};