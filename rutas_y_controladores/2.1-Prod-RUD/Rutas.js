"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");

//************************ Middlewares ******************************
// Login y Roles de Usuario
const soloUsuariosCompl = require("../../middlewares/usuarios/solo1-usuariosCompl");
const soloAptoInput = require("../../middlewares/usuarios/solo2-aptoInput");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
// Temas de captura
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");
const todos = [soloUsuariosCompl, soloAptoInput, entidad, id, permUserReg, capturaActivar];

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
