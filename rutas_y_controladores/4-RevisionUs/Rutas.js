"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
// const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

// Middlewares ***********************************************
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const aptoInput = require("../../middlewares/usuarios/aptoInput");
const soloRevisorUs = require("../../middlewares/usuarios/solo4-revisor-us");
const entidadID = require("../../middlewares/producto/entidadID");
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const algunos = [soloUsuarios, aptoInput, soloRevisorUs];
const todos = [...algunos, entidadID, permUserReg, capturaActivar];

// APIs -------------------------------------------------

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", ...algunos, vista.tableroControl);
router.get("/validar-identidad", ...todos, vista.validarIdentidadForm);
router.post("/validar-identidad", ...todos, vista.validarIdentidadGuardar);

// Exportarlo **********************************************
module.exports = router;
