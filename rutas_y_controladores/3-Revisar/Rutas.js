"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

// Middlewares ***********************************************
const soloGestionProd = require("../../middlewares/usuarios/solo3-gestion-prod");
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
const permReg = require("../../middlewares/captura/permReg");
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");

// APIs -------------------------------------------------
// Producto
router.get("/api/producto-alta", soloGestionProd, API.prodAlta);
router.get("/api/producto-edicion", soloGestionProd, API.prodEdic);
// RCLV-Alta
router.get("/api/rclv-alta", soloGestionProd, API.RCLV_Alta);
// Links
router.get("/api/link-alta", soloGestionProd, API.linkAlta);
router.get("/api/link-edicion", soloGestionProd, API.linkEdic);
router.get("/api/link-eliminar", soloGestionProd, API.linkAlta);

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", soloGestionProd, vista.tableroControl);
router.get(
	"/redireccionar",
	soloGestionProd,
	entidad,
	id,
	permUserReg,
	permReg,
	capturaActivar,
	vista.redireccionar
);
// Vistas de productos
// Producto alta
router.get(
	"/producto/alta",
	soloGestionProd,
	entidad,
	id,
	permUserReg,
	permReg,
	capturaActivar,
	vista.prod_Alta
);
// Producto edición
router.get(
	"/producto/edicion",
	soloGestionProd,
	entidad,
	id,
	permUserReg,
	permReg,
	capturaActivar,
	vista.prod_Edicion
);
// Vistas de RCLVs
router.get("/rclv", soloGestionProd, entidad, id, permUserReg, permReg, capturaActivar, vista.RCLV_Alta);
// Vistas de Links
router.get("/links", soloGestionProd, entidad, id, permReg, permUserReg, capturaActivar, vista.links);

// Exportarlo **********************************************
module.exports = router;
