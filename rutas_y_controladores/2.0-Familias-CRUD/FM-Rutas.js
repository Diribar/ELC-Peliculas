"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const vista = require("./FM-ControlVista");
const API = require("./FM-ControlAPI");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
const usRolRevEnts = require("../../middlewares/filtrosPorUsuario/usRolRevEnts");
// Específicos de productos
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const motivoNecesario = require("../../middlewares/filtrosPorRegistro/motivoNecesario");
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// Consolida
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoDetalle = [entValida, IDvalido, rutaCRUD_ID];
const aptoCRUD = [...aptoDetalle, statusCorrecto, ...aptoUsuario, permUserReg];
const aptoEliminar = [...aptoCRUD, usRolRevEnts];

//************************ Rutas ****************************
// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/api/obtiene-col-cap", API.obtieneColCap);
router.get("/api/obtiene-cap-ant-y-post", API.obtieneCapAntPostID);
router.get("/api/obtiene-cap-id", API.obtieneCapID);
router.get("/api/obtiene-capitulos", API.obtieneCapitulos);
router.get("/api/motivos-status", API.motivosRechAltas);
router.get("/api/actualiza-visibles", API.actualizarVisibles);

// CRUD-Inactivar, Recuperar, Eliminar
router.get("/:familia/inactivar", aptoCRUD, capturaActivar, vista.inacRecup.form);
router.post("/:familia/inactivar", aptoCRUD, motivoNecesario, capturaInactivar, vista.inacRecup.guardar);
router.get("/:familia/recuperar", aptoCRUD, capturaActivar, vista.inacRecup.form);
router.post("/:familia/recuperar", aptoCRUD, capturaInactivar, vista.inacRecup.guardar);
router.get("/:familia/eliminar", aptoEliminar, capturaActivar, vista.inacRecup.form);
router.post("/:familia/eliminar", aptoEliminar, capturaInactivar, vista.eliminar);
router.get("/:familia/eliminado", vista.eliminado);

// Revisión
router.get("/:familia/inactivar-o-recuperar", aptoCRUD, capturaActivar, vista.inacRecup.form);
router.get("/:familia/rechazo", aptoCRUD, capturaActivar, vista.inacRecup.form);

// Fin
module.exports = router;
