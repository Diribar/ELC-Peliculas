"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
const permisoRUD = require("../../middlewares/producto/permisoRUD");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de vistas
router.get("/detalle", soloUsuarios, entidad, id, permisoRUD, vista.detalleEdicionForm);
router.get("/calificala", soloAutInput, entidad, id, permisoRUD, vista.calificala);

router.get("/edicion", soloAutInput, entidad, id, permisoRUD, vista.detalleEdicionForm);
router.post("/edicion/guardar", soloAutInput, multer.single("avatar"), vista.edicionGuardar);
router.get("/edicion/eliminar", soloAutInput, entidad, id, permisoRUD, vista.edicionEliminar);
router.get("/links", soloAutInput, entidad, id, permisoRUD, vista.linksForm);

router.post("/links/altas-editar", soloAutInput, vista.linksAltasEditar);

// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/api/tridente/obtener-col-cap", API.obtenerColCap);
router.get("/api/tridente/obtener-cap-ant-y-post", API.obtenerCapAntPostID);
router.get("/api/tridente/obtener-cap-id", API.obtenerCapID);
// Detalle
router.get("/api/detalle/obtener-calificaciones", API.obtenerCalificaciones);
// Edición
router.get("/api/edicion/validar", API.validarEdicion);
router.get("/api/edicion/obtener-original-y-edicion", API.obtenerVersionesDelProducto);
router.get("/api/edicion/enviar-a-req-session", API.enviarAReqSession);
router.get("/api/edicion/obtener-de-req-session", API.obtenerDeReqSession);
// Links
router.get("/api/links/validar", API.linksValidar);
router.get("/api/links/obtener-provs-links", API.linksObtenerProvs);
router.get("/api/links/eliminar", API.linksEliminar);

// Fin
module.exports = router;
