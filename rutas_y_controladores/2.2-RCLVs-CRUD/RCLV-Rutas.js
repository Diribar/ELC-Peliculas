"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./RCLV-ControlAPI");
const vista = require("./RCLV-ControlVista");
const vistaCRUD = require("../2.0-Familias-CRUD/FM-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/filtro-usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/filtro-usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/filtro-usAptoInput");
// Específicos de RCLVs
const entValida = require("../../middlewares/filtrosPorEntidad/filtro-entidadValida");
const IDvalido = require("../../middlewares/filtrosPorEntidad/filtro-IDvalido");
const existeEdicion = require("../../middlewares/filtrosPorEntidad/filtro-existeEdicion");
const accesoBloq = require("../../middlewares/filtrosPorEntidad/filtro-accesoBloq");
const statusCorrecto = require("../../middlewares/filtrosPorEntidad/filtro-statusCorrecto");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorEntidad/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Consolidado
const agregar = [usAltaTerm, usPenalizaciones, usAptoInput, entValida];
const editar = [...agregar, IDvalido, existeEdicion, statusCorrecto, permUserReg, accesoBloq];
const detalle = [entValida, IDvalido, capturaInactivar, accesoBloq];
const controles = [...agregar, IDvalido, statusCorrecto, permUserReg];
// Otros
const multer = require("../../middlewares/varios/multer");

// Rutas *******************************************
// Rutas de APIs Agregar/Editar
router.get("/api/registros-con-esa-fecha", API.registrosConEsaFecha);
router.get("/api/valida-sector", API.validaSector);
router.get("/api/prefijos", API.prefijos);

// Rutas de vistas - Relación con la vida
router.get("/agregar", ...agregar, vista.altaEdicForm);
router.post("/agregar", ...agregar, multer.single("avatar"), vista.altaEdicGuardar);
router.get("/edicion", ...editar, capturaActivar, vista.altaEdicForm);
router.post("/edicion", ...editar, multer.single("avatar"), capturaInactivar, vista.altaEdicGuardar);
router.get("/detalle", ...detalle, vista.detalle);

router.get("/inactivar", controles, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/inactivar", controles, capturaInactivar, vistaCRUD.inacRecup_Guardar);
router.get("/recuperar", controles, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/recuperar", controles, capturaInactivar, vistaCRUD.inacRecup_Guardar);
router.get("/eliminar", controles, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/eliminar", controles, capturaInactivar, vistaCRUD.eliminarGuardar);
router.get("/eliminado", vistaCRUD.eliminadoForm);

// Exportarlo **********************************************
module.exports = router;
