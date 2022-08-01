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
const aptoDE = require("../../middlewares/captura/aptoDE");
const permReg = require("../../middlewares/captura/permReg");
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de APIs
// Detalle
router.get("/api/detalle/obtener-calificaciones", API.obtenerCalificaciones);
// Edición
router.get("/api/edicion/validar", API.validarEdicion);
router.get("/api/edicion/obtener-original-y-edicion", API.obtenerVersionesDelProducto);
router.get("/api/edicion/enviar-a-req-session", API.enviarAReqSession);
router.get("/api/edicion/obtener-de-req-session", API.obtenerDeReqSession);

// Rutas de vistas
// Producto
router.get("/detalle", soloUsuarios, entidad, id, capturaInactivar, vista.prod_Form);
router.get(
	"/edicion",
	soloAutInput,
	aptoDE,
	entidad,
	id,
	permReg,
	permUserReg,
	capturaActivar,
	vista.prod_Form
);
router.post("/edicion", soloAutInput, multer.single("avatar"), vista.prod_GuardarEdic);
router.get("/edicion/eliminar", soloAutInput, entidad, id, vista.prod_EliminarEdic);
// Pendiente
router.get("/calificala", soloAutInput, entidad, id, vista.calificala);

// Fin
module.exports = router;
