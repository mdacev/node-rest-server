// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;
// ============================
//  ENTORNO
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'Dev';
// ============================
//  URL
// ============================
let url = 'mongodb+srv://mariano:oL15xbTHa30Y7Frn@cluster0-1c0mb.mongodb.net/cafe';

    if( process.env.NODE_ENV === 'Dev' )
        url = 'mongodb://localhost:27017/cafe';

process.env.URLBD = url;

// ============================
//  TOKEN
// ============================
process.env.CADUCIDAD_TOKEN = Number( 1000000);
process.env.SEED = process.env.SEED || 'SEED_DESARROLLO';

// ============================
//  Google Client Id
// ============================
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '400541357062-mktdshn8cijvodmsdebummjrfro2a723.apps.googleusercontent.com'