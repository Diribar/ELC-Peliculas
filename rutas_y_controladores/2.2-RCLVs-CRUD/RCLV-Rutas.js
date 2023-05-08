"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const API = require("./RCLV-ControlAPI");
const vista = require("./RCLV-ControlVista");
const vistaCRUD = require("../2.0-Familias-CRUD/FM-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/usuarios/filtro-usAltaTerm");
const usPenalizaciones = require("../../middlewares/usuarios/filtro-usPenalizaciones");
const usAptoInput = require("../../middlewares/usuarios/filtro-usAptoInput");
// Específicos de RCLVs
const entValida = require("../../middlewares/producto/filtro-entidadValida");
const IDvalido = require("../../middlewares/producto/filtro-IDvalido");
const accesoBloq = require("../../middlewares/producto/filtro-accesoBloq");
const statusCorrecto = require("../../middlewares/producto/filtro-statusCorrecto");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
const capturaInactivar = require("../../middlewares/captura/capturaInactivar");
// Consolidado
const DE_agregar = [usAltaTerm, usPenalizaciones, usAptoInput, entValida];
const DE_editar = [...DE_agregar, IDvalido, permUserReg, accesoBloq, statusCorrecto];
const DE_detalle = [entValida, IDvalido, capturaInactivar, accesoBloq];
const controles = [usAltaTerm, usPenalizaciones, usAptoInput, entValida, IDvalido, statusCorrecto, permUserReg];
// Otros
const multer = require("../../middlewares/varios/multer");

// Rutas *******************************************
// Rutas de APIs Agregar/Editar
router.get("/api/registros-con-esa-fecha", API.registrosConEsaFecha);
router.get("/api/valida-sector", API.validaSector);
router.get("/api/prefijos", API.prefijos);

// Rutas de vistas - Relación con la vida
router.get("/agregar", ...DE_agregar, vista.altaEdicForm);
router.post("/agregar", ...DE_agregar, multer.single("avatar"), vista.altaEdicGuardar);
router.get("/edicion", ...DE_editar, capturaActivar, vista.altaEdicForm);
router.post("/edicion", ...DE_editar, multer.single("avatar"), capturaInactivar, vista.altaEdicGuardar);
router.get("/detalle", ...DE_detalle, vista.detalle);

router.get("/inactivar", controles, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/inactivar", controles, capturaInactivar, vistaCRUD.inacRecup_Guardar);
router.get("/recuperar", controles, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/recuperar", controles, capturaInactivar, vistaCRUD.inacRecup_Guardar);
router.get("/eliminar", controles, capturaActivar, vistaCRUD.inacRecup_Form);
router.post("/eliminar", controles, capturaInactivar, vistaCRUD.eliminarGuardar);

// Exportarlo **********************************************
module.exports = router;
