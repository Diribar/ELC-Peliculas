"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");
const vistaCRUD = require("../2.0-Familias-CRUD/FM-ControlVista");

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
const motivoNecesario = require("../../middlewares/filtrosPorRegistro/motivoNecesario");
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");

// Consolida
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoDetalle = [entValida, IDvalido, rutaCRUD_ID];
const base = [...aptoDetalle, statusCorrecto, ...aptoUsuario];
const aptoEdicion = [...base, edicion, permUserReg];
const aptoCRUD = [...base, permUserReg];
const aptoEliminar = [...base, usRolRevEnts, permUserReg];

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
router.get("/detalle", ...aptoDetalle, capturaInactivar, vista.prodDetalle_Form);
router.get("/edicion", ...aptoEdicion, capturaActivar, vista.prodEdicion_Form);
router.post("/edicion", ...aptoEdicion, multer.single("avatar"), vista.prodEdicion_Guardar);

router.get("/inactivar", ...aptoCRUD, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/inactivar", ...aptoCRUD, motivoNecesario, capturaInactivar, vistaCRUD.inacRecup_Guardar);
router.get("/recuperar", ...aptoCRUD, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/recuperar", ...aptoCRUD, capturaInactivar, vistaCRUD.inacRecup_Guardar);
router.get("/eliminar", ...aptoEliminar, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/eliminar", ...aptoEliminar, capturaInactivar, vistaCRUD.eliminarGuardar);
router.get("/eliminado", vistaCRUD.eliminadoForm);

// Fin
module.exports = router;
