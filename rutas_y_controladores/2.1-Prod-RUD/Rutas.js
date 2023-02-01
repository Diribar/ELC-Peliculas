"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");

//************************ Middlewares ******************************
// Comunes a todas las entidades
const soloUsuarios = require("../../middlewares/usuarios/filtro-soloUsuarios");
const usPenalizado = require("../../middlewares/usuarios/filtro-usuarioPenalizado");
const soloAptoInput = require("../../middlewares/usuarios/filtro-aptoInput");
const cartelRespons = require("../../middlewares/usuarios/filtro-cartelRespons");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/filtro-entidadInvalida");
const entidadID = require("../../middlewares/producto/filtro-IDinvalido");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");
const todos = [
	soloUsuarios,
	usPenalizado,
	cartelRespons,
	soloAptoInput,
	entidad,
	entidadID,
	permUserReg,
	capturaActivar,
];

//************************ Rutas ****************************
// Rutas de APIs
// Detalle
router.get("/api/detalle/obtiene-calificaciones", API.obtieneCalificaciones);
// Edición
router.get("/api/edicion/valida", API.validaEdicion);
router.get("/api/edicion/obtiene-original-y-edicion", API.obtieneVersionesDelProducto);
router.get("/api/edicion/enviar-a-req-session", API.enviarAReqSession);
router.get("/api/edicion/eliminar", API.prod_EliminarEdicG);

// Rutas de vistas
// Producto
router.get("/detalle", entidad, entidadID, capturaInactivar, vista.prodDetEdic_Form);
router.get("/edicion", ...todos, vista.prodDetEdic_Form);
router.post("/edicion", ...todos, multer.single("avatar"), vista.prodEdic_Guardar);
// Pendiente
router.get("/calificala", ...todos, vista.calificala);

// Fin
module.exports = router;
