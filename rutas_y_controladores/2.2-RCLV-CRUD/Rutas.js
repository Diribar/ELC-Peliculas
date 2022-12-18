"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./RCLV-ControlAPI");
const vista = require("./RCLV-ControlVista");

//************************ Middlewares ******************************
// Login y Roles de Usuario
const soloUsuariosCompl = require("../../middlewares/usuarios/solo1-usuariosCompl");
const soloAptoInput = require("../../middlewares/usuarios/solo2-aptoInput");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
// Temas de captura
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Consolidado
const todosAgregar = [soloUsuariosCompl, soloAptoInput, entidad];
const todos = [...todosAgregar, id, permUserReg, capturaActivar];

// Rutas *******************************************
// Rutas de APIs Agregar/Editar
router.get("/api/registros-con-esa-fecha", API.registrosConEsaFecha);
router.get("/api/valida-sector", API.valida);
router.get("/api/consecuencias", API.consecuencias);
router.get("/api/prefijos", API.prefijos);

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
