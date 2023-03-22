"use strict";
// Definir variables
const express = require("express");
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// Middlewares
let consDescon = require("../../middlewares/urls/urlConsultaDescon");

// API
router.get("/api/opciones-de-filtro-personalizado", API.opcionesFiltro);

// Vistas
router.get("/", vista.consultas);
router.get("/:layoutElegido", consDescon, vista.consultas);

// Fin
module.exports = router;
