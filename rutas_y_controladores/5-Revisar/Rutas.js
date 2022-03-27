"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloGestionProd = require("../../middlewares/usuarios/solo3-gestion-prod");
const entidadId = require("../../middlewares/producto/validarEntidadId");
const permisoProducto = require("../../middlewares/producto/permisoRevProducto");
const permisoUsuario = require("../../middlewares/producto/permisoRevUsuario");

// Rutas *******************************************
// Vistas
router.get("/vision-general", soloGestionProd, vista.visionGeneral);
router.get("/redireccionar", soloGestionProd, vista.redireccionar);
router.get(
	"/producto/perfil",
	soloGestionProd,
	entidadId,
	permisoUsuario,
	permisoProducto,
	vista.productoPerfil
);
router.get(
	"/producto/edicion",
	soloGestionProd,
	entidadId,
	permisoUsuario,
	permisoProducto,
	vista.productoEdicion
);
// router.get("/rclv", soloGestionProd, vista.visionGeneral);
// router.get("/links", soloGestionProd, vista.visionGeneral);

// API
router.get("/producto/perfil/api/liberar-y-salir", soloGestionProd, API.liberarSalir);
router.get("/producto/perfil/api/pre-autorizar", soloGestionProd, API.preAutorizar);
router.get("/producto/perfil/api/inactivar", soloGestionProd, API.inactivar);

// Exportarlo **********************************************
module.exports = router;
