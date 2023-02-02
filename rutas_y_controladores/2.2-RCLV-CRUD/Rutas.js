"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./RCLV-ControlAPI");
const vista = require("./RCLV-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/usuarios/filtro-usAltaTerm");
const penalizaciones = require("../../middlewares/usuarios/filtro-usPenalizaciones");
const usAptoInput = require("../../middlewares/usuarios/filtro-usAptoInput");
// Específicos de RCLVs
const entValida = require("../../middlewares/producto/filtro-entidadValida");
const IDvalido = require("../../middlewares/producto/filtro-IDvalido");
const edicBloqueada = require("../../middlewares/producto/filtro-edicBloqueada");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Consolidado
const DE_agregar = [usAltaTerm, penalizaciones, usAptoInput, entValida];
const DE_editar = [...DE_agregar, IDvalido, edicBloqueada, permUserReg];

// Rutas *******************************************
// Rutas de APIs Agregar/Editar
router.get("/api/registros-con-esa-fecha", API.registrosConEsaFecha);
router.get("/api/valida-sector", API.valida);
router.get("/api/prefijos", API.prefijos);

// Rutas de vistas - Relación con la vida
router.get("/agregar", ...DE_agregar, vista.altaEdicForm);
router.post("/agregar", ...DE_agregar, vista.altaEdicGrabar);
router.get("/edicion", ...DE_editar, capturaActivar, vista.altaEdicForm);
router.post("/edicion", ...DE_editar, capturaInactivar, vista.altaEdicGrabar);
router.get("/detalle", entValida, IDvalido, capturaInactivar, vista.detalle);
// router.get("/inactivar", ...DE_editar, vista.inactivar);
// router.get("/recuperar", ...DE_editar, vista.recuperar);

// Exportarlo **********************************************
module.exports = router;
