// Requires ************************************************
const express = require("express");
const router = express.Router();
const controlador = require("./Controlador");

// Controladores *******************************************
router.get('/', controlador.home) 				// Redirecciona a Películas
router.get('/nosotros', controlador.nosotros) 	// Acerca de nosotros
router.get("/agregar/personaje-historico", controlador.personajeHistorico);
router.get("/agregar/hecho-historico", controlador.hechoHistorico);

// Exportarlo **********************************************
module.exports = router;
