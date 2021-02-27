const express= require('express');
const controlador = require('../controladores/ecc')

const router = express.Router();

/*** LOGIN ***/
router.get('/', controlador.login)
router.post('/', controlador.login_realizado)

/*** REGISTRO ***/
router.get('/registro', controlador.registro)
router.post('/registro', controlador.registro_realizado)

/*** HOME - QUIÉNES SOMOS - CONTÁCTANOS ***/
router.get('/:id', controlador.main)

module.exports = router;
