"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
// const API = require("./ControlAPI");
const vista = require("./RU-ControlVista");

// Middlewares ***********************************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const revisorEnts = require("../../middlewares/filtrosPorUsuario/usRolRevUs");
// Específicos de entidades
const IDvalido = require("../../middlewares/filtrosPorEntidad/IDvalido");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorEntidad/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Consolidados
const aptoRevisor = [usAltaTerm, usPenalizaciones, revisorEnts];
const aptoRevMasEnt = [...aptoRevisor, IDvalido, permUserReg, capturaActivar];

// APIs -------------------------------------------------

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", ...aptoRevisor, vista.tableroControl);
// Identidad
router.get("/identidad", ...aptoRevMasEnt, vista.identidadForm);
router.post("/identidad", ...aptoRevMasEnt, vista.identidadGuardar);

// Exportarlo **********************************************
module.exports = router;
