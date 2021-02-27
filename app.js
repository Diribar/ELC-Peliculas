const express = require('express')
let path = require('path')
const rutaECC = require('./controladores y rutas/rutas/ecc');
const rutaPelis = require('./controladores y rutas/rutas/peliculas');

const app = express()


app.use(express.static(path.resolve('public')));

app.set("view engine", "ejs")
app.set('views', [path.resolve(__dirname, './views'), path.resolve(__dirname, './views/00Base_General'), path.resolve(__dirname, './views/01Base_Peliculas'),path.resolve(__dirname, './views/10Contenido_ECC'), path.resolve(__dirname, './views/11Contenido_Peliculas')]);

app.listen(3001, () => console.log('Servidor funcionando en puerto 3001...'))

app.use('/peliculas', rutaPelis) /** HOME PELÍCULAS **/
app.use('/', rutaECC)  /** LOGIN_REALIZADO - HOME - REGISTRO - ACERCA DE NOSOTROS - CONTÁCTANOS */

