"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");

// Rutas *******************************************
// Rutas de APIs
router.get("/api/otros-casos/", API.buscarOtrosCasos);
router.get("/api/validar/", API.validarRCLV);

// Rutas de vistas - Relación con la vida
router.get("/redireccionar", soloAutInput, vista.Redireccionar);
router.get("/personajes", soloAutInput, vista.RCLV_Form);
router.get("/hechos", soloAutInput, vista.RCLV_Form);
router.post("/personajes", soloAutInput, vista.RCLV_Grabar);
router.post("/hechos", soloAutInput, vista.RCLV_Grabar);

// Exportarlo **********************************************
module.exports = router;
