const express = require('express')
let path = require('path')
const ruta = require('./controlador y rutas/rutas');

const app = express()


app.use(express.static(path.resolve('public')));

app.set("view engine", "ejs")
app.listen(3001, () => console.log('Servidor funcionando en puerto 3001...'))

app.use('/', ruta)
app.use('/peliculas', ruta)
app.use('/:id', ruta)
