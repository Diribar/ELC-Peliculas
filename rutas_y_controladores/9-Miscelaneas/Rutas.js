"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

// Middlewares ***********************************************
const soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");

// Vistas *******************************************
// Vistas de APIs
router.get("/api/quick-search/", API.quickSearch);
router.get("/api/horario-inicial/", soloAutInput, API.horarioInicial);

// Vistas de vistas - Institucional
router.get("/", vista.home);
router.get("/quienes-somos", vista.quienesSomos);

// Session y Cookies
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Miscelaneas
router.get("/inactivar-captura", entidad, id, capturaInactivar, vista.redireccionar);

// Exportarlo **********************************************
module.exports = router;
