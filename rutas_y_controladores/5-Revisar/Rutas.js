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

// Rutas de Vistas *******************************************
// Vistas Generales
router.get("/tablero-de-control", soloGestionProd, vista.tableroControl);
router.get("/inactivar-captura", soloGestionProd, vista.inactivarCaptura);
router.get(
	"/redireccionar",
	soloGestionProd,
	entidadId,
	permisoUsuario,
	permisoProducto,
	vista.redireccionar
);
// Vistas de productos
router.get(
	"/producto/alta",
	soloGestionProd,
	entidadId,
	permisoUsuario,
	permisoProducto,
	vista.productoAlta
);
router.get(
	"/producto/edicion",
	soloGestionProd,
	entidadId,
	permisoUsuario,
	permisoProducto,
	vista.productoEdicion
);
// Vistas de RCLVs
router.get("/rclv", soloGestionProd, vista.RCLV);

// Vistas de Links
// router.get("/links", soloGestionProd, vista.tableroControl);

// Rutas de APIs *******************************************
// Entidades
router.get("/api/liberar-y-salir", soloGestionProd, API.liberarSalir);
// Producto-Alta
router.get("/producto/alta/api/aprobar", soloGestionProd, API.aprobarAlta);
router.get("/producto/alta/api/rechazar", soloGestionProd, API.rechazarAlta);
// Producto-Edición
router.get("/producto/edicion/api/editar-campo", soloGestionProd, API.aprobRechCampo);

// Exportarlo **********************************************
module.exports = router;
