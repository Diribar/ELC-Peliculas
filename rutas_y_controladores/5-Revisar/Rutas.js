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
router.get("/vision-general", soloGestionProd, vista.visionGeneral);
router.get(
	"/producto/perfil",
	soloGestionProd,
	entidadId,
	permisoProducto,
	permisoUsuario,
	vista.productoPerfil
);
// router.get("/rclv", soloGestionProd, vista.visionGeneral);
// router.get("/links", soloGestionProd, vista.visionGeneral);

// Exportarlo **********************************************
module.exports = router;
