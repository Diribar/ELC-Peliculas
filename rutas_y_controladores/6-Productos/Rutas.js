"use strict";
// Definir variables
const express = require("express");
const router = express.Router();
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");

// Vistas de Opciones
router.get("/:id", vista.opcion);
router.get("/:id/:id", vista.tipo);
// router.post("/:id/:id", soloUsuarios, vista.filtros);
router.get("/", vista.home);

// Fin
module.exports = router;
