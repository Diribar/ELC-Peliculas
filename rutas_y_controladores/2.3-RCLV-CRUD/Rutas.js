"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
const aptoDE = require("../../middlewares/captura/aptoDE");
const permReg = require("../../middlewares/captura/permReg");
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
const capturaActivar = require("../../middlewares/captura/capturaActivar");

// Rutas *******************************************
// Rutas de APIs
router.get("/api/otros-casos", API.buscarOtrosCasos);
router.get("/api/validar-campo", API.validarCampo);
router.get("/api/validar-consolidado", API.validarConsolidado);

// Rutas de vistas - Relación con la vida
router.get("/redireccionar", soloAutInput, vista.redireccionar);
router.get("/agregar", soloAutInput, entidad, id, aptoDE, permReg, permUserReg, capturaActivar, vista.RCLV_AltaForm);
router.post("/agregar", soloAutInput, entidad, id, aptoDE, vista.RCLV_Grabar);

router.get("/detalle", soloAutInput, entidad, id, capturaInactivar, vista.RCLV_Form);
router.get("/editar", soloAutInput, entidad, id, aptoDE, permReg, permUserReg, capturaActivar, vista.RCLV_Form);
router.get("/eliminar", soloAutInput, aptoDE, vista.RCLV_Eliminar);

// Exportarlo **********************************************
module.exports = router;
