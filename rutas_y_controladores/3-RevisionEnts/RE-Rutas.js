"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
const API = require("./RE-ControlAPI");
const vista = require("./RE-ControlVista");
const vistaRCLV = require("../2.2-RCLVs-CRUD/RCLV-ControlVista");
const vistaCRUD = require("../2.0-Familias-CRUD/FM-ControlVista");

// Middlewares ***********************************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/usuarios/filtro-usAltaTerm");
const usPenalizaciones = require("../../middlewares/usuarios/filtro-usPenalizaciones");
const usRolRevEnts = require("../../middlewares/usuarios/filtro-usRolRevEnts");
// Específicos de entidades
const entValida = require("../../middlewares/producto/filtro-entidadValida");
const IDvalido = require("../../middlewares/producto/filtro-IDvalido");
const statusCorrecto = require("../../middlewares/producto/filtro-statusCorrecto");
const existeEdicion = require("../../middlewares/producto/filtro-existeEdicion");
const motivoNecesario = require("../../middlewares/producto/filtro-motivoNecesario");
const motivoOpcional = require("../../middlewares/producto/filtro-motivoOpcional");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usRolRevEnts];
const aptoStatus = [entValida, IDvalido, statusCorrecto, ...aptoUsuario, permUserReg];
const aptoEdicion = [entValida, IDvalido, statusCorrecto, ...aptoUsuario, existeEdicion, permUserReg];

// APIs -------------------------------------------------
// Producto y RCLV
router.get("/api/edicion/motivo-generico", API.obtieneMotivoGenerico);
router.get("/api/edicion/aprob-rech", API.edicAprobRech);

// Links
router.get("/api/link/alta-baja", API.linkAltaBaja);
router.get("/api/link/eliminar", API.linkAltaBaja);
router.get("/api/link/edicion", API.edicAprobRech);

// VISTAS --------------------------------------------------
// Tablero de Control
router.get("/tablero-de-control", ...aptoUsuario, vista.tableroControl);

// Producto y RCLV
// Altas Form
router.get("/producto/alta", ...aptoStatus, capturaActivar, vista.prod_altaForm);
router.get("/rclv/alta", ...aptoStatus, capturaActivar, vistaRCLV.altaEdicForm);
router.get("/:familia/rechazo", aptoStatus, capturaActivar, vista.inactivarRecup_Form);
// Altas Guardar
router.post("/:familia/alta", ...aptoStatus, capturaInactivar, vista.prodRCLV_Guardar);
router.post("/:familia/rechazo", ...aptoStatus, motivoNecesario, capturaInactivar, vista.prodRCLV_Guardar);
// Inactivar o Recuperar
router.get("/:familia/inactivar-o-recuperar", ...aptoStatus, capturaActivar, vista.inactivarRecup_Form);
router.post("/:familia/inactivar-o-recuperar", ...aptoStatus, capturaInactivar, vista.prodRCLV_Guardar); // Va sin 'motivo'
// Edición
router.get("/:familia/edicion", ...aptoEdicion, capturaActivar, vista.prodRCLV_edicForm);
router.post("/:familia/edicion", ...aptoEdicion, motivoOpcional, capturaInactivar, vista.prod_AvatarGuardar);
// Links
router.get("/links", ...aptoStatus, capturaActivar, vista.linksForm);

// Exporta **********************************************
module.exports = router;
