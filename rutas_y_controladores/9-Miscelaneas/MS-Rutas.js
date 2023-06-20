"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./MS-ControlAPI");
const vista = require("./MS-ControlVista");

//************************ Middlewares ******************************
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");
const entidadRclv = require("../../middlewares/filtrosPorRegistro/entidadRclv");

//************************ Rutas ****************************
// Rutas de APIs
router.get("/api/quick-search/", API.quickSearch);
router.get("/api/horario-inicial/", API.horarioInicial);
router.get("/api/localhost", API.localhost);

// Rutas de vistas
// Redireccionar a Inicio
router.get("/", vista.redireccionarInicio);
router.get("/inicio", vista.redireccionarInicio);

// Session y Cookies
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Miscelaneas
router.get("/inactivar-captura", capturaInactivar, vista.redireccionar);
router.get("/:id", entidadRclv, vista.listadoRCLVs);

// Exportarlo **********************************************
module.exports = router;
