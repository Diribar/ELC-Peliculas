const express = require('express')
let path = require('path')
const rutaECC = require('./controladores y rutas/rutas/ecc');
const rutaProductos = require('./controladores y rutas/rutas/productos');

const app = express()


app.use(express.static(path.resolve('public')));

app.set("view engine", "ejs")
app.listen(3001, () => console.log('Servidor funcionando en puerto 3001...'))

app.use('/', rutaECC)   /** LOGIN **/
app.use('/peliculas', rutaProductos) /** HOME PELÍCULAS **/
app.use('/:id', rutaECC) /** LOGIN_REALIZADO - HOME - REGISTRO - ACERCA DE NOSOTROS - CONTÁCTANOS */
