"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");

// Vistas *******************************************
// Vistas de APIs
router.get("/quick-search/", API.quickSearch);

// Vistas de vistas - Institucional
router.get("/", vista.home);
router.get("/nosotros", vista.nosotros);

// Miscelaneas
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Exportarlo **********************************************
module.exports = router;
