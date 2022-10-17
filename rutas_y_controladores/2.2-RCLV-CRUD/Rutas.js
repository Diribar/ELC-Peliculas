"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
// Login y Roles de Usuario
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const aptoInput = require("../../middlewares/usuarios/aptoInput");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
// Temas de captura
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Consolidado
const todosAgregar = [soloUsuarios, aptoInput, entidad];
const todos = [...todosAgregar, id, permUserReg, capturaActivar];

// Rutas *******************************************
// Rutas de APIs
router.get("/api/otros-casos", API.buscarOtrosCasos);
router.get("/api/validar-sector", API.validar);

// Rutas de vistas - Relación con la vida
router.get("/agregar", ...todosAgregar, vista.altaEdicForm);
router.post("/agregar", ...todosAgregar, vista.altaEdicGrabar);
router.get("/edicion", ...todos, vista.altaEdicForm);
router.post("/edicion", ...todos, capturaInactivar, vista.altaEdicGrabar);
router.get("/detalle", entidad, id, capturaInactivar, vista.detalle);
// router.get("/inactivar", ...todos, vista.inactivar);
// router.get("/recuperar", ...todos, vista.recuperar);

// Exportarlo **********************************************
module.exports = router;
