const { Router } = require('express');
const express= require('express');
const controlador = require('../controladores/peliculas')

const router = express.Router();

/*** PELÍCULAS ***/
router.get('/peliculas', controlador.peliculas)
router.get('/peliculas/filtros', controlador.peli_filtros)

module.exports = router;
