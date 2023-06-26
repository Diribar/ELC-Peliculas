"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
// const API = require("./ControlAPI");
const vista = require("./MT-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
// Varios
const controles = [usAltaTerm, usPenalizaciones, usAptoInput];

//************************ Rutas ****************************
// Rutas de vistas
router.get("/", ...controles, vista.tablero);

// Exportarlo **********************************************
module.exports = router;
