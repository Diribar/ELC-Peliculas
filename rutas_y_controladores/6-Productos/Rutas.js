"use strict";
// Definir variables
const express = require("express");
const router = express.Router();
const vista = require("./ControladorVista");

// Middlewares
let soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
let urlAceptadas = require("../../middlewares/varios/urlAceptadas");

// Home
router.get("/", vista.home);

// Vistas de Opciones
router.get("/:id", urlAceptadas, vista.opcion);
router.get("/:id/:id", urlAceptadas, vista.subOpcion);
// router.post("/:id/:id", soloUsuarios, vista.filtros);

// Fin
module.exports = router;
