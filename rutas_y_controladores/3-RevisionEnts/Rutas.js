"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
const API = require("./RE-ControlAPI");
const vista = require("./RE-ControlVista");
const vistaAltaRCLV = require("../2.2-RCLV-CRUD/RCLV-ControlVista");

// Middlewares ***********************************************
const soloUsuariosCompl = require("../../middlewares/usuarios/solo1-usuariosCompl");
const soloAptoInput = require("../../middlewares/usuarios/solo2-aptoInput");
const soloRevisorEnts = require("../../middlewares/usuarios/solo3-revisor-ents");
const entidad = require("../../middlewares/producto/entidadNombre");
const entidadID = require("../../middlewares/producto/entidadID");
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const algunos = [soloUsuariosCompl, soloAptoInput, soloRevisorEnts];
const todos = [...algunos, entidad, entidadID, permUserReg, capturaActivar];

// APIs -------------------------------------------------
// Producto
router.get("/api/edicion-aprob-rech", ...algunos, API.edic_AprobRech);
router.get("/api/producto-guarda-avatar", ...algunos, API.prodEdic_ConvierteUrlEnArchivo);
// Links
router.get("/api/link-alta", ...algunos, API.linkAlta);
router.get("/api/link-edicion", ...algunos, API.linkEdic);
router.get("/api/link-eliminar", ...algunos, API.linkAlta);

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", ...algunos, vista.tableroControl);
// Producto
router.get("/producto/alta", ...todos, vista.prodAltaForm);
router.post("/producto/alta", ...todos, vista.prodAltaGuardar);
router.get("/producto/edicion", ...todos, vista.prodEdicForm);
router.get("/producto/inactivar");
router.get("/producto/recuperar");
// RCLV
router.get("/rclv/alta", ...todos, vistaAltaRCLV.altaEdicForm);
router.post("/rclv/alta", ...todos, vista.rclvAltaGuardar);
router.get("/rclv/edicion", ...todos, vista.rclvEdicForm);

// Links
router.get("/links", ...todos, vista.linksForm);

// Exportarlo **********************************************
module.exports = router;
