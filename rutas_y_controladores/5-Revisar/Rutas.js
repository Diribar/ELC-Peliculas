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
const permUserReg = require("../../middlewares/producto/permUserReg");
const permReg = require("../../middlewares/producto/permReg");
const capturaActivar = require("../../middlewares/producto/capturaActivar");

// Rutas de Vistas *******************************************
// Vistas Generales
router.get("/tablero-de-control", soloGestionProd, vista.tableroControl);
router.get("/inactivar-captura", soloGestionProd, entidad, id, vista.inactivarCaptura);
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
router.get(
	"/links",
	soloGestionProd,
	entidad,
	id,
	permReg,
	permUserReg,
	capturaActivar,
	vista.links
);

// Rutas de APIs *******************************************
// Uso compartido
router.get("/api/liberar-y-salir", soloGestionProd, API.liberarSalir);
// Producto
router.get("/api/producto-alta", soloGestionProd, API.prodAltas);
router.get("/api/producto-edicion", soloGestionProd, API.prodEdics);
// RCLV-Alta
router.get("/api/rclv-alta", soloGestionProd, API.RCLV_Altas);

// Exportarlo **********************************************
module.exports = router;
