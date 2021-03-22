// Requires ************************************************
const express= require('express');
const router = express.Router();
const controlador = require('../controladores/home');

// Controladores *******************************************
router.get('/', controlador.home) // Home
router.get('/:id', controlador.main) // Quiénes Somos, Contáctanos

// Exportarlo **********************************************
module.exports = router;
