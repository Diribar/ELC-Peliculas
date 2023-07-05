"use strict";
// Variables
const express = require("express");
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// API - Startup
router.get("/api/obtiene-las-preferencias-de-cabecera", API.obtiene.prefsDeCabecera);
router.get("/api/obtiene-las-preferencias-de-campos", API.obtiene.prefsDeCampos);
router.get("/api/obtiene-layouts-y-ordenes", API.obtiene.layoutsMasOrdenes);
router.get("/api/obtiene-los-dias-del-ano", API.obtiene.diasDelAno);

// API - Filtros personalizados
router.get("/api/guarda-nueva-configuracion", API.guarda.configNueva);
router.get("/api/actualiza-configActual_id", API.actualiza.configActual_id);
router.get("/api/actualiza-prefs-filtroPers", API.actualiza.prefsDeCampos);

// API - Resultados
router.get("/api/obtiene-los-productos", API.resultados.prods);
router.get("/api/obtiene-los-rclvs", API.resultados.rclvs);

// Vistas
router.get("/", vista.consultas);

// Fin
module.exports = router;
