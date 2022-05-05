"use strict";
// Definir variables
const express = require("express");
const router = express.Router();
const vista = require("./ControladorVista");

// Middlewares
let soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
let vistasProductos = require("../../middlewares/varios/vistasProductos");

// Home
router.get("/", vista.home);

// Vistas de Opciones
router.get("/:id", vistasProductos, vista.opcion);
router.get("/:id/:id", vistasProductos, vista.subOpcion);
// router.post("/:id/:id", soloUsuarios, vista.filtros);

// Fin
module.exports = router;
