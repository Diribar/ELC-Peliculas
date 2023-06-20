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
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");
// Consolidados
const aptoRevisor = [usAltaTerm, usPenalizaciones, revisorEnts];
const aptoRevMasRegistro = [...aptoRevisor, IDvalido, permUserReg];

// APIs -------------------------------------------------

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", ...aptoRevisor, vista.tableroControl);
// Identidad
router.get("/validar-identidad", ...aptoRevMasRegistro, capturaActivar, vista.validaIdentForm);
router.post("/validar-identidad", ...aptoRevMasRegistro, capturaInactivar, vista.validaIdentGuardar);

// Exportarlo **********************************************
module.exports = router;
