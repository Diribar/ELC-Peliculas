"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./MS-ControlAPI");
const vista = require("./MS-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
// Varios
const controles = [usAltaTerm, usPenalizaciones, usAptoInput];
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");
const entidadRclv = require("../../middlewares/filtrosPorRegistro/entidadRclv");

//************************ Rutas ****************************
// Rutas de APIs
router.get("/api/quick-search/", API.quickSearch);
router.get("/api/horario-inicial/", API.horarioInicial);
router.get("/api/localhost", API.localhost);

// Rutas de vistas
// Inactivar captura
router.get("/inactivar-captura", capturaInactivar, vista.redireccionar);

// Tablero de mantenimiento
router.get("/mantenimiento", ...controles, vista.tableroMantenim);

// Redireccionar a Inicio
router.get("/", vista.redireccionarInicio);
router.get("/inicio", vista.redireccionarInicio);

// Contenido de session y cookies
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Productos por RCLV
router.get("/:id", entidadRclv, vista.listadoRCLVs);

// Exportarlo **********************************************
module.exports = router;
