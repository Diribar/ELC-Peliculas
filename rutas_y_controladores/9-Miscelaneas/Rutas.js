"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");

// Vistas *******************************************
// Vistas de APIs
router.get("/api/quick-search/", API.quickSearch);
router.get("/api/horario-inicial/", API.horarioInicial);

// Vistas de vistas - Institucional
router.get("/", vista.home);
router.get("/nosotros", vista.nosotros);

// Miscelaneas
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Exportarlo **********************************************
module.exports = router;
