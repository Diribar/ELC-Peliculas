// Requires ************************************************
const express= require('express');
const router = express.Router();
const controlador = require('../controladores/institucional');

// Controladores *******************************************
router.get('/', controlador.home) // Redirecciona a Películas
router.get('/:id', controlador.main) // Acerca de nosotros, Contáctanos

// Exportarlo **********************************************
module.exports = router;
