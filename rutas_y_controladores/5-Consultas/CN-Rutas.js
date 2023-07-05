"use strict";
// Variables
const express = require("express");
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// API - Startup
router.get("/api/obtiene-layouts-y-ordenes", API.obtieneLayoutsMasOrdenes);
router.get("/api/obtiene-las-preferencias-del-fp", API.obtienePrefsFP);
router.get("/api/obtiene-los-dias-del-ano", API.obtieneDiasDelAno);

// API - Filtros personalizados
router.get("/api/actualiza-fp_id", API.actualizaFP_id);
router.get("/api/actualiza-prefs-fp", API.actualizaPrefsFP);

// API - Consultas
router.get("/api/obtiene-los-productos", API.obtieneProds);
router.get("/api/obtiene-los-rclvs", API.obtieneRCLVs);

// Vistas
router.get("/", vista.consultas);

// Fin
module.exports = router;
