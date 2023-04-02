"use strict";
// Definir variables
const express = require("express");
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// API
router.get("/api/layouts-y-ordenes", API.layoutsOrdenes);
router.get("/api/opciones-de-filtro-personalizado", API.opcionesFiltro);
router.get("/api/guarda-filtro_id", API.guardaFiltro_id);
router.get("/api/obtiene-los-productos", API.obtieneProductos);
router.get("/api/obtiene-los-rclvs", API.obtieneRCLVs);

// Vistas
router.get("/", vista.consultas);

// Fin
module.exports = router;
