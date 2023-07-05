"use strict";
// Variables
const express = require("express");
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// API - Startup
router.get("/api/obtiene-layouts-y-ordenes", API.obtiene.layoutsMasOrdenes);
router.get("/api/obtiene-las-preferencias-del-filtroPers", API.obtiene.prefsFP);
router.get("/api/obtiene-los-dias-del-ano", API.obtiene.diasDelAno);

// API - Filtros personalizados
router.get("/api/actualiza-filtroPers_id", API.actualiza.filtroPers_id);
router.get("/api/actualiza-prefs-filtroPers", API.actualiza.prefsFiltroPers);

// API - Resultados
router.get("/api/obtiene-los-productos", API.resultados.prods);
router.get("/api/obtiene-los-rclvs", API.resultados.rclvs);

// Vistas
router.get("/", vista.consultas);

// Fin
module.exports = router;
