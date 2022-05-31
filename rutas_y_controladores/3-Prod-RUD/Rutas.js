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
const permisoRUD = require("../../middlewares/producto/permisoRUD");
const captura = require("../../middlewares/producto/captura");
// Varios
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de vistas
// Producto
router.get("/detalle", soloUsuarios, entidad, id, permisoRUD, vista.prod_Form);
router.get("/edicion", soloAutInput, entidad, id, permisoRUD, captura, vista.prod_Form);
router.post("/edicion/guardar", soloAutInput, multer.single("avatar"), vista.prod_GuardarEdic);
router.get("/edicion/eliminar", soloAutInput, entidad, id, permisoRUD, vista.prod_EliminarEdic);
// Links
router.get("/links", soloAutInput, entidad, id, permisoRUD, captura, vista.linksForm);
router.post("/links/guardar", soloAutInput, vista.linksGuardar);
// Pendiente
router.get("/calificala", soloAutInput, entidad, id, permisoRUD, vista.calificala);

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
