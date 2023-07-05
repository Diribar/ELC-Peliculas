"use strict";
// Variables
const express = require("express");
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// API - Startup
router.get("/api/layouts-y-ordenes", API.layoutsMasOrdenes);
router.get("/api/opciones-de-filtro-personalizado", API.opcionesFiltrosCampo);
router.get("/api/dias-del-ano", API.diasDelAno);

// API - Filtros personalizados
router.get("/api/guarda-filtro_id", API.guardaFiltroPers_id);
router.get("/api/fp-actualiza", API.actualizaFiltroPers);

// API - Consultas
router.get("/api/momento-del-ano", API.momentoDelAno);
router.get("/api/obtiene-los-productos", API.obtieneProductos);
router.get("/api/obtiene-los-rclvs", API.obtieneRCLVs);

// Vistas
router.get("/", vista.consultas);

// Fin
module.exports = router;
