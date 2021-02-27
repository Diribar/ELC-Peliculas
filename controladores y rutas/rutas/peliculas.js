const express= require('express');
const controlador = require('../controladores/peliculas')

const router = express.Router();

router.get('/', controlador.home) //--> HOME
//router.get('/:id', controlador.pelicula) //--> PELICULA

module.exports = router;
