"use strict";
// Definir variables
const express = require("express");
const router = express.Router();
const vista = require("./CN-ControlVista");

// Middlewares
let consDescon = require("../../middlewares/urls/urlConsultaDescon");

// Home
router.get("/", vista.consultasSinLayout);

// Vistas de Opciones
router.get("/:opcion", consDescon, vista.consultasConLayout);

// Fin
module.exports = router;
