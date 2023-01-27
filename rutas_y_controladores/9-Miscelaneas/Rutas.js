"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControlAPI");
const vista = require("./ControlVista");

// Middlewares ***********************************************
const soloUsuariosTerm = require("../../middlewares/usuarios/filtro-soloUsuariosTerm");
const soloAptoInput = require("../../middlewares/usuarios/filtro-3soloAptoInput");
const entidad = require("../../middlewares/producto/filtro-entidadNombre");
const id = require("../../middlewares/producto/filtro-entidadID");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
const todos = [soloUsuariosTerm, soloAptoInput, entidad, id, capturaInactivar];

// Vistas *******************************************
// Vistas de APIs
router.get("/api/quick-search/", API.quickSearch);
router.get("/api/horario-inicial/", API.horarioInicial);

// Inicio
router.get("/", vista.inicio);

// Vistas de vistas - Institucional
router.get("/quienes-somos", vista.quienesSomos);
router.get("/mision-y-vision", vista.misionVision);
router.get("/valores", vista.valores);
router.get("/derechos-de-autor", vista.derechosAutor);
router.get("/data-entry", vista.dataEntry);

// Session y Cookies
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Miscelaneas
router.get("/inactivar-captura", ...todos, vista.redireccionar);

// Exportarlo **********************************************
module.exports = router;
