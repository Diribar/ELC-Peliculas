"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./RCLV-ControlAPI");
const vista = require("./RCLV-ControlVista");
const vistaCRUD = require("../2.0-Familias-CRUD/FM-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
const usRolRevEnts = require("../../middlewares/filtrosPorUsuario/usRolRevEnts");
// Específicos de RCLVs
const entValida = require("../../middlewares/filtrosPorEntidad/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorEntidad/IDvalido");
const edicion = require("../../middlewares/filtrosPorEntidad/edicion");
const statusCorrecto = require("../../middlewares/filtrosPorEntidad/statusCorrecto");
const motivoNecesario = require("../../middlewares/filtrosPorEntidad/motivoNecesario");
const rclvNoEditable = require("../../middlewares/filtrosPorEntidad/rclvNoEditable");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorEntidad/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");

// Consolidado
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoAgregar = [entValida, ...aptoUsuario];
const aptoDetalle = [entValida, IDvalido, capturaInactivar];
const base = [entValida, IDvalido, statusCorrecto, ...aptoUsuario];
const aptoEdicion = [...base, edicion, permUserReg, rclvNoEditable];
const aptoCRUD = [...base, permUserReg];
const aptoEliminar = [...base, usRolRevEnts, permUserReg];

// Rutas *******************************************
// Rutas de APIs Agregar/Editar
router.get("/api/registros-con-esa-fecha", API.registrosConEsaFecha);
router.get("/api/valida-sector", API.validaSector);
router.get("/api/prefijos", API.prefijos);

// Rutas de vistas - Relación con la vida
router.get("/agregar", ...aptoAgregar, vista.altaEdicForm);
router.post("/agregar", ...aptoAgregar, multer.single("avatar"), vista.altaEdicGuardar);
router.get("/edicion", ...aptoEdicion, capturaActivar, vista.altaEdicForm);
router.post("/edicion", ...aptoEdicion, multer.single("avatar"), capturaInactivar, vista.altaEdicGuardar);
router.get("/detalle", ...aptoDetalle, vista.detalle);

router.get("/inactivar", aptoCRUD, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/inactivar", aptoCRUD, motivoNecesario, capturaInactivar, vistaCRUD.inacRecup_Guardar);
router.get("/recuperar", aptoCRUD, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/recuperar", aptoCRUD, capturaInactivar, vistaCRUD.inacRecup_Guardar);
router.get("/eliminar", aptoEliminar, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/eliminar", aptoEliminar, capturaInactivar, vistaCRUD.eliminarGuardar);
router.get("/eliminado", vistaCRUD.eliminadoForm);

// Exportarlo **********************************************
module.exports = router;
