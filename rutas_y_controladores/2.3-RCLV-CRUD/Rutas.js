"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
const aptoDE = require("../../middlewares/captura/aptoDE");
const permReg = require("../../middlewares/captura/permReg");
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");

// Rutas *******************************************
// Rutas de APIs
router.get("/api/otros-casos/", API.buscarOtrosCasos);
router.get("/api/validar-campo/", API.validarCampo);
router.get("/api/validar-consolidado/", API.validarConsolidado);

// Rutas de vistas - Relación con la vida
router.get("/redireccionar", soloAutInput, vista.redireccionar);
router.get("/agregar", soloAutInput, aptoDE, vista.RCLV_Form);
router.post("/agregar", soloAutInput, vista.RCLV_Grabar);

// Exportarlo **********************************************
module.exports = router;
