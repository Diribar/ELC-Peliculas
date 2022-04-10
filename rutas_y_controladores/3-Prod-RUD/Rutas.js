"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
const entidadId = require("../../middlewares/producto/validarEntidadId");
const permisoRUD = require("../../middlewares/producto/permisoRUD");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de vistas
router.get("/detalle", soloUsuarios, entidadId, permisoRUD, vista.detalleEdicionForm);
router.get("/calificala", soloAutInput, entidadId, permisoRUD, vista.calificala);

router.get("/edicion", soloAutInput, entidadId, permisoRUD, vista.detalleEdicionForm);
router.post(
	"/edicion/guardar",
	soloAutInput,
	multer.single("avatar"),
	vista.edicionGuardar
);
router.get("/edicion/eliminar", soloAutInput, entidadId, permisoRUD, vista.edicionEliminar);
router.get("/links", soloAutInput, entidadId, permisoRUD, vista.linksForm);

router.post("/links/altas-editar", soloAutInput, vista.linksAltasEditar);

// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/tridente/api/obtener-col-cap", API.obtenerColCap);
router.get("/tridente/api/obtener-cap-ant-y-post", API.obtenerCapAntPostID);
router.get("/tridente/api/obtener-cap-id", API.obtenerCapID);
// Detalle
router.get("/detalle/api/obtener-calificaciones", API.obtenerCalificaciones);
// Edición
router.get("/edicion/api/validar-edicion", API.validarEdicion);
router.get("/edicion/api/obtener-original-y-edicion", API.obtenerVersionesDelProducto);
router.get("/edicion/api/enviar-a-req-session", API.enviarAReqSession);
router.get("/edicion/api/obtener-de-req-session", API.obtenerDeReqSession);
// Links
router.get("/links/api/validar-links", API.linksValidar);
router.get("/links/api/obtener-provs-links", API.linksObtenerProvs);
router.get("/links/eliminar", API.linksEliminar);

// Fin
module.exports = router;
