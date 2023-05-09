"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");
const vistaCRUD = require("../2.0-Familias-CRUD/FM-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/usuarios/filtro-usAltaTerm");
const usPenalizaciones = require("../../middlewares/usuarios/filtro-usPenalizaciones");
const usAptoInput = require("../../middlewares/usuarios/filtro-usAptoInput");
// Específicos de productos
const entValida = require("../../middlewares/producto/filtro-entidadValida");
const IDvalido = require("../../middlewares/producto/filtro-IDvalido");
const existeEdicion = require("../../middlewares/producto/filtro-existeEdicion");
const statusCorrecto = require("../../middlewares/producto/filtro-statusCorrecto");
const motivoNecesario = require("../../middlewares/producto/filtro-motivoNecesario");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");
const edicion = [usAltaTerm, usPenalizaciones, usAptoInput, entValida, IDvalido, statusCorrecto, existeEdicion, permUserReg];
const controles = [usAltaTerm, usPenalizaciones, usAptoInput, entValida, IDvalido, statusCorrecto, permUserReg];

//************************ Rutas ****************************
// Rutas de APIs
// Detalle
router.get("/api/obtiene-calificaciones", API.obtieneCalificaciones);
// Edición
router.get("/api/valida", API.validaEdicion);
router.get("/api/obtiene-original-y-edicion", API.obtieneVersionesProd);
router.get("/api/envia-a-req-session", API.enviarAReqSession);
router.get("/api/edicion-nueva/eliminar", API.eliminaEdicN);
router.get("/api/edicion-guardada/eliminar", API.eliminaEdicG);

// Rutas de vistas
router.get("/detalle", entValida, IDvalido, capturaInactivar, vista.prodDetalle_Form);
router.get("/edicion", ...edicion, capturaActivar, vista.prodEdicion_Form);
router.post("/edicion", ...edicion, multer.single("avatar"), vista.prodEdicion_Guardar);

router.get("/inactivar", controles, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/inactivar", controles, motivoNecesario, capturaInactivar, vistaCRUD.inacRecup_Guardar);
router.get("/recuperar", controles, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/recuperar", controles, capturaInactivar, vistaCRUD.inacRecup_Guardar);
router.get("/eliminar", controles, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/eliminar", controles, capturaInactivar, vistaCRUD.eliminarGuardar);
router.get("/eliminado", vistaCRUD.eliminadoForm);

// Fin
module.exports = router;
