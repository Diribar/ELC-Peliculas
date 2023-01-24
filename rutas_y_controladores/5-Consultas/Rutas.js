"use strict";
// Definir variables
const express = require("express");
const router = express.Router();
const vista = require("./CN-ControlVista");

// Middlewares
let urlAceptadas = require("../../middlewares/varios/urlAceptadas");

// Home
router.get("/", vista.consultasSinLayout);

// Vistas de Opciones
router.get("/:opcion", urlAceptadas, vista.consultasConLayout);

// Fin
module.exports = router;
