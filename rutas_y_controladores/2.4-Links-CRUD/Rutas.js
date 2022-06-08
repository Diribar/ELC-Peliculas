"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
// Login y Roles de Usuario
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
// Temas de captura
const aptoDE = require("../../middlewares/usuarios/aptoDE");
const permReg = require("../../middlewares/producto/permReg");
const permUserReg = require("../../middlewares/producto/permUserReg");
const capturaActivar = require("../../middlewares/producto/capturaActivar");
const capturaInactivar = require("../../middlewares/producto/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de vistas
// Links
router.get(
	"/abm",
	soloAutInput,
	entidad,
	id,
	aptoDE,
	permReg,
	permUserReg,
	capturaActivar,
	vista.linksForm
);
router.post("/abm", soloAutInput, vista.linksGuardar);

// Rutas de APIs
// Links
router.get("/api/validar", API.linksValidar);
router.get("/api/obtener-provs-links", API.linksObtenerProvs);
router.get("/api/eliminar", API.linksEliminar);

// Fin
module.exports = router;
