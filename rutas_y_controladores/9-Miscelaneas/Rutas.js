// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

// Controladores *******************************************
// Controladores de APIs
router.get("/agregar/api/personajesFecha/", API.personajesFecha);
router.get("/agregar/api/validarPersonaje/", API.validarPersonaje);
router.get("/agregar/api/validarHecho/", API.validarHecho);

// Controladores de vistas
// Institucional
router.get("/", vista.home);
router.get("/nosotros", vista.nosotros);
// Personajes y Hechos históricos
router.get("/agregar/personaje-historico", vista.personajeHistoricoForm);
router.post("/agregar/personaje-historico", vista.personajeHistoricoGrabar);
router.get("/agregar/hecho-historico", vista.hechoHistoricoForm);
router.post("/agregar/hecho-historico", vista.hechoHistoricoGrabar);

// Exportarlo **********************************************
module.exports = router;
