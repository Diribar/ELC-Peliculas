"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
// const API = require("./ControlAPI");
const vista = require("./MT-ControlVista");

//************************ Middlewares ******************************

//************************ Rutas ****************************
// Rutas de vistas
// Mantenimiento
router.get("/", vista.mantenimiento);

// Exportarlo **********************************************
module.exports = router;
