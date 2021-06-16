// Requires ************************************************
const express= require('express');
const router = express.Router();
const controlador = require('./0-Institucional-Contr');

// Controladores *******************************************
router.get('/', controlador.home) 				// Redirecciona a Películas
router.get('/nosotros', controlador.nosotros) 	// Acerca de nosotros

// Exportarlo **********************************************
module.exports = router;
