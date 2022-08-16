"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
// Login y Roles de Usuario
const soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
// Temas de captura
const aptoDE = require("../../middlewares/captura/aptoDE");
const permReg = require("../../middlewares/captura/permReg");
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Consolidados
const todos = [soloAutInput, entidad, id, aptoDE, permReg, permUserReg, capturaActivar];

//************************ Rutas ****************************
// Rutas de APIs
// Links
router.get("/api/validar", API.validar);
router.get("/api/obtener-provs-links", API.obtenerProvs);
router.get("/api/guardar", API.guardar);
router.get("/api/eliminar", API.eliminar);
router.get("/api/recuperar", API.recuperar);
router.get("/api/deshacer", API.deshacer);

// Rutas de vistas
// Links
router.get("/abm", ...todos, vista.linksForm);

// Fin
module.exports = router;
