"use strict";
// Variables
const express = require("express");
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// API - Obtiene
router.get("/api/obtiene-las-preferencias-de-cabecera", API.obtiene.prefsDeCabecera);
router.get("/api/obtiene-las-preferencias-de-campos", API.obtiene.prefsDeCampos);

// API - Guarda
router.get("/api/actualiza-configCons_id", API.guarda.configCons_id);
router.get("/api/crea-una-configuracion", API.guarda.creaConfig);
router.get("/api/guarda-una-configuracion", API.guarda.guardaConfig);

// API - Resultados
router.get("/api/obtiene-los-productos", API.resultados.prods);
router.get("/api/obtiene-los-rclvs", API.resultados.rclvs);

// Vistas
router.get("/", vista.consultas);

// Fin
// router.get("/api/obtiene-layouts-y-ordenes", API.obtiene.layoutsMasOrdenes);
// router.get("/api/obtiene-los-dias-del-ano", API.obtiene.diasDelAno);
module.exports = router;
