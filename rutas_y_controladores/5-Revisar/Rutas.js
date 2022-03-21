"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloGestionProd = require("../../middlewares/usuarios/solo3-gestion-prod");
const entidadId = require("../../middlewares/producto/entidadId");
const permisoProducto = require("../../middlewares/producto/permisoRV_producto");

// Rutas *******************************************
router.get("/vision-general", soloGestionProd, vista.visionGeneral);
router.get("/producto", soloGestionProd, entidadId, permisoProducto, vista.producto);
// router.get("/rclv", soloGestionProd, vista.visionGeneral);
// router.get("/links", soloGestionProd, vista.visionGeneral);

// Exportarlo **********************************************
module.exports = router;
