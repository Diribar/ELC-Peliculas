"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const vista = require("./ControlVista");

// Vistas *******************************************
// Vistas de vistas - Institucional
router.get("/inicio", vista.inicio);
router.get("/quienes-somos", vista.quienesSomos);
router.get("/mision-y-vision", vista.misionVision);
router.get("/valores", vista.valores);
router.get("/derechos-de-autor", vista.derechosAutor);
router.get("/data-entry", vista.dataEntry);

// Exportarlo **********************************************
module.exports = router;
