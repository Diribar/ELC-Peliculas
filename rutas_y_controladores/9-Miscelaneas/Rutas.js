"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

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

// Vistas de vistas - Institucional
router.get("/", vista.home);
router.get("/quienes-somos", vista.quienesSomos);
router.get("/derechos-de-autor", vista.copyright);
router.get("/nuestro-perfil-de-peliculas", vista.perfilProductos);

// Session y Cookies
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Miscelaneas
router.get("/inactivar-captura", ...todos, vista.redireccionar);

// Exportarlo **********************************************
module.exports = router;
