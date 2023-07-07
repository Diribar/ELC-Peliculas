"use strict";
// Variables
const express = require("express");
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// API - Obtiene
router.get("/api/obtiene-la-configuracion-de-cabecera", API.obtiene.configDeCabecera);
router.get("/api/obtiene-la-configuracion-de-campos", API.obtiene.configDeCampos);
router.get("/api/obtiene-las-configs-posibles-de-cabecera", API.obtiene.configsDeCabecera);
router.get("/api/obtiene-las-opciones-de-layout-y-orden", API.obtiene.opcionesDeLayoutMasOrden);

// API - Guarda
router.get("/api/actualiza-configCons_id-en-cookie-session-y-usuario", API.guarda.configCons_id);
router.get("/api/crea-una-configuracion", API.guarda.creaConfig);
router.get("/api/guarda-una-configuracion", API.guarda.guardaConfig);
router.get("/api/elimina-configuracion-de-consulta", API.guarda.eliminaConfigCons);

// API - Resultados
router.get("/api/obtiene-los-productos", API.resultados.prods);
router.get("/api/obtiene-los-rclvs", API.resultados.rclvs);

// Vistas
router.get("/", vista.consultas);

// Fin
// router.get("/api/obtiene-los-dias-del-ano", API.obtiene.diasDelAno);
module.exports = router;
