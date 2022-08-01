"use strict";
// Requires ************************************************
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
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");

// Rutas *******************************************
// Rutas de APIs
router.get("/api/otros-casos", API.buscarOtrosCasos);
router.get("/api/validar-sector", API.validarSector);
router.get("/api/validar-consolidado", API.validarConsolidado);

// Rutas de vistas - Relación con la vida
router.get("/agregar", soloAutInput, aptoDE, entidad, vista.altaEdicForm);
router.get(
	"/edicion",
	soloAutInput,
	aptoDE,
	entidad,
	id,
	permReg,
	permUserReg,
	capturaActivar,
	vista.altaEdicForm
);
router.post("/agregar", soloAutInput, aptoDE, entidad, vista.altaEdicGrabar);
router.post("/edicion", soloAutInput, aptoDE, entidad, id, permReg, permUserReg, vista.altaEdicGrabar);
router.get("/detalle", entidad, id, capturaInactivar, vista.detalle);
// router.get("/eliminar", soloAutInput, entidad, id, aptoDE, permReg, permUserReg, vista.RCLV_Eliminar);

// Exportarlo **********************************************
module.exports = router;
