"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
// const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

// Middlewares ***********************************************
const soloUsuariosCompl = require("../../middlewares/usuarios/solo1-usuariosCompl");
const soloAptoInput = require("../../middlewares/usuarios/solo2-aptoInput");
const soloRevisorUs = require("../../middlewares/usuarios/solo4-revisor-us");
const entidadID = require("../../middlewares/producto/entidadID");
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const algunos = [soloUsuariosCompl, soloAptoInput, soloRevisorUs];
const todos = [...algunos, entidadID, permUserReg, capturaActivar];

// APIs -------------------------------------------------

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", ...algunos, vista.tableroControl);
router.get("/valida-identidad", ...todos, vista.validaIdentidadForm);
router.post("/valida-identidad", ...todos, vista.validaIdentidadGuardar);

// Exportarlo **********************************************
module.exports = router;
