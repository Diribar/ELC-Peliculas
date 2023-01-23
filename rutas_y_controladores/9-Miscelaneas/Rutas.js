"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControlAPI");
const vista = require("./ControlVista");

// Middlewares ***********************************************
const soloUsuariosCompl = require("../../middlewares/usuarios/solo1-usuariosCompl");
const soloAptoInput = require("../../middlewares/usuarios/solo2-aptoInput");
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
const todos = [soloUsuariosCompl, soloAptoInput, entidad, id, capturaInactivar];

// Vistas *******************************************
// Vistas de APIs
router.get("/api/quick-search/", API.quickSearch);
router.get("/api/horario-inicial/", API.horarioInicial);

// Inicio
router.get("/", vista.inicio);

// Vistas de vistas - Institucional
router.get("/quienes-somos", vista.quienesSomos);
router.get("/mision-y-vision", vista.misionVision);
router.get("/valores", vista.valores);
router.get("/derechos-de-autor", vista.derechosAutor);
router.get("/data-entry", vista.dataEntry);

// Session y Cookies
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Miscelaneas
router.get("/inactivar-captura", ...todos, vista.redireccionar);

// Exportarlo **********************************************
module.exports = router;
