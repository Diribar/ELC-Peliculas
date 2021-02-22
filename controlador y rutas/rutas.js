const { Router } = require('express');
const express= require('express');
const controlador = require('./controlador')

const router = express.Router();

/*** LOGIN ***/
router.get('/', controlador.login)
router.post('/', controlador.login_realizado)

router.get('/peliculas', controlador.peliculas)
router.get('/peliculas/filtros', controlador.peli_filtros)


router.get('/:id', controlador.main)
/* router.get('/peliculas/:id', controlador.peli_id) */

module.exports = router;
