"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./RCLV-ControlAPI");
const vista = require("./RCLV-ControlVista");

//************************ Middlewares ******************************
// Login y Roles de Usuario
const soloUsuariosTerm = require("../../middlewares/usuarios/filtro-2soloUsuariosTerm");
const soloAptoInput = require("../../middlewares/usuarios/filtro-3soloAptoInput");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/filtro-entidadNombre");
const entidadID = require("../../middlewares/producto/filtro-entidadID");
const jesus = require("../../middlewares/producto/filtro-jesus");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Consolidado
const todosAgregar = [soloUsuariosTerm, soloAptoInput, entidad];
const todos = [...todosAgregar, entidadID, permUserReg, capturaActivar];

// Rutas *******************************************
// Rutas de APIs Agregar/Editar
router.get("/api/registros-con-esa-fecha", API.registrosConEsaFecha);
router.get("/api/valida-sector", API.valida);
router.get("/api/prefijos", API.prefijos);

// Rutas de vistas - Relación con la vida
router.get("/agregar", ...todosAgregar, vista.altaEdicForm);
router.post("/agregar", ...todosAgregar, vista.altaEdicGrabar);
router.get("/edicion", ...todos, jesus, vista.altaEdicForm);
router.post("/edicion", ...todos, capturaInactivar, vista.altaEdicGrabar);
router.get("/detalle", entidad, entidadID, capturaInactivar, vista.detalle);
// router.get("/inactivar", ...todos, vista.inactivar);
// router.get("/recuperar", ...todos, vista.recuperar);

// Exportarlo **********************************************
module.exports = router;
