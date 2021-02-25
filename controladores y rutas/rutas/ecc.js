const { Router } = require('express');
const express= require('express');
const controlador = require('../controladores/ecc')

const router = express.Router();

/*** LOGIN ***/
router.get('/', controlador.login)
router.post('/', controlador.login_realizado)

/*** REGISTER ***/
router.get('/registro', controlador.registro)
router.post('/registro', controlador.registro_realizado)

/*** HOME - QUIÉNES SOMOS - CONTÁCTANOS - REGISTRO ***/
router.get('/:id', controlador.main)
/* router.get('/peliculas/:id', controlador.peli_id) */

module.exports = router;
