"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControlAPI");
const vista = require("./ControlVista");

// Vistas *******************************************
// Vistas de APIs
router.get("/api/quick-search/", API.quickSearch);
router.get("/api/horario-inicial/", API.horarioInicial);

// Redireccionar a Inicio
router.get("/", vista.redireccionarInicio);
router.get("/inicio", vista.redireccionarInicio);

// Session y Cookies
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Miscelaneas
router.get("/inactivar-captura", vista.redireccionar);

// Exportarlo **********************************************
module.exports = router;
