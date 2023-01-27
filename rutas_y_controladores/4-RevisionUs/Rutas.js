"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
// const API = require("./ControlAPI");
const vista = require("./RU-ControlVista");

// Middlewares ***********************************************
const usPenalizado = require("../../middlewares/usuarios/filtro-usuarioPenalizado");
const soloRevisorUs = require("../../middlewares/usuarios/filtro-soloRol3-RevUs");
const entidadID = require("../../middlewares/producto/filtro-entidadID");
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const algunos = [usPenalizado, soloRevisorUs];
const todos = [...algunos, entidadID, permUserReg, capturaActivar];

// APIs -------------------------------------------------

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", ...algunos, vista.tableroControl);
router.get("/valida-identidad", ...todos, vista.validaIdentidadForm);
router.post("/valida-identidad", ...todos, vista.validaIdentidadGuardar);

// Exportarlo **********************************************
module.exports = router;
