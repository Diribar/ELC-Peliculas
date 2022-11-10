"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
// Login y Roles de Usuario
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const aptoInput = require("../../middlewares/usuarios/aptoInput");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
// Temas de captura
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");
const todos = [soloUsuarios, aptoInput, entidad, id, permUserReg, capturaActivar];

//************************ Rutas ****************************
// Rutas de APIs
// Detalle
router.get("/api/detalle/obtiene-calificaciones", API.obtieneCalificaciones);
// Edición
router.get("/api/edicion/validar", API.validarEdicion);
router.get("/api/edicion/obtiene-original-y-edicion", API.obtieneVersionesDelProducto);
router.get("/api/edicion/enviar-a-req-session", API.enviarAReqSession);
router.get("/api/edicion/eliminar", API.prod_EliminarEdicG);

// Rutas de vistas
// Producto
router.get("/detalle", entidad, id, capturaInactivar, vista.prodEdicForm_Detalle);
router.get("/edicion", ...todos, vista.prodEdicForm_Detalle);
router.post("/edicion", ...todos, multer.single("avatar"), vista.prodEdicGuardar);
// Pendiente
router.get("/calificala", ...todos, vista.calificala);

// Fin
module.exports = router;
