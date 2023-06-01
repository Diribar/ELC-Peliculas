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
// Varios
const controles = [usAltaTerm, usPenalizaciones];

//************************ Rutas ****************************
// Rutas de vistas
router.get("/", ...controles, vista.mantenimiento);

// Exportarlo **********************************************
module.exports = router;
