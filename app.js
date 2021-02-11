const express = require('express')
const app = express()
let path = require('path')

app.listen(3001, () => console.log('Servidor funcionando en puerto 3001...'))
app.use(express.static(path.resolve('public')));

app.get('/', (req, res) => {res.sendFile(path.resolve(__dirname, 'views/0-0-HOME.html'))})
app.get('/peliculas', (req, res) => {res.sendFile(path.resolve(__dirname, 'views/0-1-PELICULAS.html'))})
