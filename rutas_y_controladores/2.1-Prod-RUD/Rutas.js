"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/usuarios/filtro-usAltaTerm");
const usPenalizaciones = require("../../middlewares/usuarios/filtro-usPenalizaciones");
const usAptoInput = require("../../middlewares/usuarios/filtro-usAptoInput");
// Específicos de productos
const entValida = require("../../middlewares/producto/filtro-entidadValida");
const IDvalido = require("../../middlewares/producto/filtro-IDvalido");
const existeEdicion = require("../../middlewares/producto/filtro-existeEdicion");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");
const edicion = [entValida, IDvalido, existeEdicion, usAltaTerm, usPenalizaciones, usAptoInput, permUserReg, capturaActivar];

//************************ Rutas ****************************
// Rutas de APIs
// Detalle
router.get("/api/detalle/obtiene-calificaciones", API.obtieneCalificaciones);
// Edición
router.get("/api/edicion/valida", API.validaEdicion);
router.get("/api/edicion/obtiene-original-y-edicion", API.obtieneVersionesProd);
router.get("/api/edicion/enviar-a-req-session", API.enviarAReqSession);
router.get("/api/edicion/eliminar", API.eliminaEdicG);

// Rutas de vistas
// Producto
router.get("/detalle", entValida, IDvalido, capturaInactivar, vista.prodDetEdic_Form);
router.get("/edicion", ...edicion, vista.prodDetEdic_Form);
router.post("/edicion", ...edicion, multer.single("avatar"), vista.prodEdic_Guardar);

// Fin
module.exports = router;
