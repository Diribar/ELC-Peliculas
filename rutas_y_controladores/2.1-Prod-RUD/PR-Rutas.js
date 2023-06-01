"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");
const vistaCRUD = require("../2.0-Familias-CRUD/FM-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/filtro-usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/filtro-usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/filtro-usAptoInput");
const usRolRevEnts = require("../../middlewares/filtrosPorUsuario/filtro-usRolRevEnts");
// Específicos de productos
const entValida = require("../../middlewares/filtrosPorEntidad/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorEntidad/IDvalido");
const edicion = require("../../middlewares/filtrosPorEntidad/edicion");
const statusCorrecto = require("../../middlewares/filtrosPorEntidad/statusCorrecto");
const motivoNecesario = require("../../middlewares/filtrosPorEntidad/motivoNecesario");
const prodID = require("../../middlewares/varios/prodID");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorEntidad/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");

// Consolida
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoDetalle = [entValida, IDvalido, capturaInactivar, prodID];
const base = [entValida, IDvalido, statusCorrecto, ...aptoUsuario];
const aptoEdicion = [...base, edicion, permUserReg, prodID];
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
router.get("/detalle", ...aptoDetalle, vista.prodDetalle_Form);
router.get("/edicion", ...aptoEdicion, capturaActivar, prodID, vista.prodEdicion_Form);
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
