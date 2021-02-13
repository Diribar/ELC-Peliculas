const express = require('express')
let path = require('path')
const ruta = require('./2-rutas/rutas');

const app = express()


app.use(express.static(path.resolve('public')));

app.set("view engine", "ejs")
app.listen(3001, () => console.log('Servidor funcionando en puerto 3001...'))

app.get('/', ruta)
app.get('/:id', ruta)
app.get('/peliculas/:id', ruta)
