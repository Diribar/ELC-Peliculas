"use strict";
// Definir variables
const express = require("express");
const router = express.Router();
const vista = require("./CN-ControlVista");

// Middlewares
let consDescon = require("../../middlewares/urls/urlConsultaDescon");

// Vistas
router.get("/", vista.consultas);
router.get("/:layoutElegido", consDescon, vista.consultas);

// Fin
module.exports = router;
