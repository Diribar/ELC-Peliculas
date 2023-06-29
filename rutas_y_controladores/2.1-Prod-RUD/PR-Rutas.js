"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
const usRolRevEnts = require("../../middlewares/filtrosPorUsuario/usRolRevEnts");
// Específicos de productos
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const edicion = require("../../middlewares/filtrosPorRegistro/edicion");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");

// Consolida
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoDetalle = [entValida, IDvalido, rutaCRUD_ID];
const aptoCalificar = [...aptoDetalle, statusCorrecto, ...aptoUsuario];
const aptoCRUD = [...aptoCalificar, permUserReg];
const aptoEdicion = [...aptoCRUD, edicion];

//************************ Rutas ****************************
// Rutas de APIs
// Detalle y Calificar
router.get("/api/obtiene-calificaciones", API.obtieneCalificaciones);
// Edición
router.get("/api/valida", API.validaEdicion);
router.get("/api/obtiene-original-y-edicion", API.obtieneVersionesProd);
router.get("/api/envia-a-req-session", API.enviarAReqSession);
router.get("/api/edicion-nueva/eliminar", API.eliminaEdicN);
router.get("/api/edicion-guardada/eliminar", API.eliminaEdicG);

// Rutas de vistas
router.get("/detalle", aptoDetalle, capturaInactivar, vista.prodDetalle);
router.get("/edicion", aptoEdicion, capturaActivar, vista.prodEdicion.form);
router.post("/edicion", aptoEdicion, multer.single("avatar"), vista.prodEdicion.guardar);
router.get("/calificar", aptoCalificar, vista.calificaProd.form);

// Fin
module.exports = router;
