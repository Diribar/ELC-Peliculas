"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
// const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

// Middlewares ***********************************************
const soloRevisorUs = require("../../middlewares/usuarios/solo4-revisor-us");

// APIs -------------------------------------------------

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", soloRevisorUs, vista.tableroControl);
router.get("/permiso-inputs", soloRevisorUs, vista.permisoInputs);

// Exportarlo **********************************************
module.exports = router;
