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
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usRolRevEnts = require("../../middlewares/filtrosPorUsuario/usRolRevEnts");
// Específicos de entidades
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const edicion = require("../../middlewares/filtrosPorRegistro/edicion");
const motivoNecesario = require("../../middlewares/filtrosPorRegistro/motivoNecesario");
const motivoOpcional = require("../../middlewares/filtrosPorRegistro/motivoOpcional");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Consolidado
const aptoUsuario = [usAltaTerm, usPenalizaciones, usRolRevEnts];
const aptoStatus = [entValida, IDvalido, statusCorrecto, ...aptoUsuario, permUserReg];
const aptoEdicion = [entValida, IDvalido, statusCorrecto, ...aptoUsuario, edicion, permUserReg];
// Otros
const multer = require("../../middlewares/varios/multer");

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

// PRODUCTO y RCLV
// Altas Form
router.get("/producto/alta", ...aptoStatus, capturaActivar, vista.prod_altaForm);
router.get("/rclv/alta", ...aptoStatus, capturaActivar, vistaRCLV.altaEdicForm);
router.get("/rclv/solapamiento", ...aptoStatus, capturaActivar, vistaRCLV.altaEdicForm);
router.get("/:familia/rechazo", aptoStatus, capturaActivar, vistaCRUD.inacRecup_Form);
// Altas Guardar
router.post("/producto/alta", ...aptoStatus, capturaInactivar, vista.prodRCLV_ARIR_guardar);
router.post("/rclv/alta", ...aptoStatus, multer.single("avatar"), capturaInactivar, vista.prodRCLV_ARIR_guardar);
router.post("/:familia/rechazo", ...aptoStatus, motivoNecesario, capturaInactivar, vista.prodRCLV_ARIR_guardar);
router.post("/rclv/solapamiento", ...aptoStatus, multer.single("avatar"), capturaInactivar, vista.solapamGuardar);
// Inactivar o Recuperar
router.get("/:familia/inactivar-o-recuperar", ...aptoStatus, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/:familia/inactivar-o-recuperar", ...aptoStatus, capturaInactivar, vista.prodRCLV_ARIR_guardar); // Va sin 'motivo'
// Edición
router.get("/:familia/edicion", ...aptoEdicion, capturaActivar, vista.prodRCLV_edicForm);
router.post("/:familia/edicion", ...aptoEdicion, motivoOpcional, capturaInactivar, vista.avatarGuardar);

// LINKS
router.get("/links", ...aptoStatus, capturaActivar, vista.linksForm);

// Exporta **********************************************
module.exports = router;
