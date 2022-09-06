"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

// Middlewares ***********************************************
const soloRevisorEnts = require("../../middlewares/usuarios/solo3-revisor-ents");
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const todos = [soloRevisorEnts, entidad, id, permUserReg, capturaActivar];

// APIs -------------------------------------------------
// Producto
router.get("/api/producto-alta", soloRevisorEnts, API.prodAlta);
router.get("/api/producto-edicion", soloRevisorEnts, API.prodEdic);
// RCLV-Alta
router.get("/api/rclv-alta", soloRevisorEnts, API.RCLV_Alta);
// Links
router.get("/api/link-alta", soloRevisorEnts, API.linkAlta);
router.get("/api/link-edicion", soloRevisorEnts, API.linkEdic);
router.get("/api/link-eliminar", soloRevisorEnts, API.linkAlta);

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", soloRevisorEnts, vista.tableroControl);
// Producto
router.get("/producto/alta", ...todos, vista.prod_Alta);
router.get("/producto/edicion", ...todos, vista.prod_Edicion);
router.get("/producto/inactivar");
router.get("/producto/recuperar");
// RCLV
router.get("/rclv/alta", ...todos, vista.RCLV_Alta);
// Links
router.get("/links", ...todos, vista.links);

// Exportarlo **********************************************
module.exports = router;
