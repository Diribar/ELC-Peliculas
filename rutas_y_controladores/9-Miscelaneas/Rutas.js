// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

// Controladores *******************************************
// Controladores de APIs
router.get("/agregar/api/personaje/", API.validarPersonaje);
router.get("/agregar/api/hecho/", API.validarHecho);
router.get("/agregar/api/personajesFecha/", API.personajesFecha);

// Controladores de vistas
// Institucional
router.get("/", vista.home);
router.get("/nosotros", vista.nosotros);
// Personajes y Hechos históricos
router.get("/agregar/personaje-historico", vista.personajeHistoricoForm);
router.put("/agregar/personaje-historico", vista.personajeHistoricoGrabar);
router.get("/agregar/hecho-historico", vista.hechoHistoricoForm);
router.put("/agregar/hecho-historico", vista.hechoHistoricoGrabar);

// Exportarlo **********************************************
module.exports = router;
