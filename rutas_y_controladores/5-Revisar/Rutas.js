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
// router.get("/rclv", soloGestionProd, vista.tableroControl);
// router.get("/links", soloGestionProd, vista.tableroControl);

// API
// Producto
router.get("/api/liberar-y-salir", soloGestionProd, API.liberarSalir);
// Producto-Alta
router.get("/producto/alta/api/aprobar", soloGestionProd, API.aprobarAlta);
router.get("/producto/alta/api/rechazar", soloGestionProd, API.rechazarAlta);
// Producto-Edición
router.get("/producto/edicion/api/editar-campo", soloGestionProd, API.editarCampo);

// Exportarlo **********************************************
module.exports = router;
