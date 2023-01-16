"use strict";
// Definir variables
const express = require("express");
const router = express.Router();
const vista = require("./ControlVista");

// Middlewares
let urlAceptadas = require("../../middlewares/varios/urlAceptadas");

// Home
router.get("/", vista.home);

// Vistas de Opciones
router.get("/:opcion", urlAceptadas, vista.consultas);

// Fin
module.exports = router;
