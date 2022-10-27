"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");
const vistaAltaRCLV = require("../2.2-RCLV-CRUD/ControladorVista");

// Middlewares ***********************************************
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const aptoInput = require("../../middlewares/usuarios/aptoInput");
const soloRevisorEnts = require("../../middlewares/usuarios/solo3-revisor-ents");
const entidad = require("../../middlewares/producto/entidadNombre");
const entidadID = require("../../middlewares/producto/entidadID");
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const algunos = [soloUsuarios, aptoInput, soloRevisorEnts];
const todos = [...algunos, entidad, entidadID, permUserReg, capturaActivar];

// APIs -------------------------------------------------
// Producto
router.get("/api/producto-alta", ...algunos, API.prodAlta);
router.get("/api/producto-edicion", ...algunos, API.prodEdic);
// RCLV-Alta
router.get("/api/rclv-alta", ...algunos, API.RCLV_Alta);
// Links
router.get("/api/link-alta", ...algunos, API.linkAlta);
router.get("/api/link-edicion", ...algunos, API.linkEdic);
router.get("/api/link-eliminar", ...algunos, API.linkAlta);

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", ...algunos, vista.tableroControl);
// Producto
router.get("/producto/alta", ...todos, vista.prodAltaForm);
router.get("/producto/edicion", ...todos, vista.prodEdicForm);
router.get("/producto/inactivar");
router.get("/producto/recuperar");
// RCLV
router.get("/rclv/alta", ...todos, vistaAltaRCLV.altaEdicForm);
router.post("/rclv/alta", ...todos, vista.altaGuardar);
// Links
router.get("/links", ...todos, vista.linksForm);

// Exportarlo **********************************************
module.exports = router;
