const express= require('express');
const controlador = require('./controlador')

const router = express.Router();

router.get('/', controlador.home)
router.get('/peliculas', controlador.peliculas)
router.get('/peliculas/filtros', controlador.peli_filtros)
/* router.get('/peliculas/:id', controlador.peli_id) */
/* router.get('/:id', controlador.main) */

module.exports = router;
