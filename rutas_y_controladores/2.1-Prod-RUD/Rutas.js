"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");

//************************ Middlewares ******************************
// Login y Roles de Usuario
const soloUsuariosTerm = require("../../middlewares/usuarios/filtro-2soloUsuariosTerm");
const soloAptoInput = require("../../middlewares/usuarios/filtro-3soloAptoInput");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/filtro-entidadNombre");
const id = require("../../middlewares/producto/filtro-entidadID");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");
const todos = [soloUsuariosTerm, soloAptoInput, entidad, id, permUserReg, capturaActivar];

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
router.get("/detalle", entidad, id, capturaInactivar, vista.prodDetEdic_Form);
router.get("/edicion", ...todos, vista.prodDetEdic_Form);
router.post("/edicion", ...todos, multer.single("avatar"), vista.prodEdic_Guardar);
// Pendiente
router.get("/calificala", ...todos, vista.calificala);

// Fin
module.exports = router;
