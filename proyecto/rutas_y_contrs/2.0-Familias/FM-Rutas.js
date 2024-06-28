"use strict";
// Variables
const router = express.Router();
const vista = require("./FM-ControlVista");
const API = require("./FM-ControlAPI");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
const usRolRevPERL = require("../../middlewares/filtrosPorUsuario/usRolRevPERL");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const creadoPorUsuario = require("../../middlewares/filtrosPorRegistro/creadoPorUsuario");
const motivoNecesario = require("../../middlewares/filtrosPorRegistro/motivoNecesario");
const comentNecesario = require("../../middlewares/filtrosPorRegistro/comentNecesario");
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");

// Middlewares - Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// Middlewares - Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoDetalle = [entValida, IDvalido, rutaCRUD_ID];
const aptoCRUD = [...aptoDetalle, statusCorrecto, ...aptoUsuario, permUserReg];
const aptoEliminar = [...aptoCRUD, usRolRevPERL];
const eliminadoPorCreador = [...aptoUsuario, entValida, IDvalido, statusCorrecto, creadoPorUsuario];

// APIs - Detalle, Edición, Links
router.get("/crud/api/obtiene-col-cap", API.obtieneColCap);
router.get("/crud/api/obtiene-cap-ant-y-post", API.obtieneCapAntPostID);
router.get("/crud/api/obtiene-cap-id", API.obtieneCapID);
router.get("/crud/api/obtiene-capitulos", API.obtieneCapitulos);
router.get("/crud/api/motivos-status", API.motivosStatus);

// Vistas - CRUD: Inactivar
router.get("/:familia/inactivar", aptoCRUD, capturaActivar, vista.inactivarRechazar_form);
router.post("/:familia/inactivar", aptoCRUD, motivoNecesario, capturaInactivar, vista.inacRecup_guardar);

// Vistas - CRUD: Recuperar
router.get("/:familia/recuperar", aptoCRUD, capturaActivar, vista.inacRecupElim_form);
router.post("/:familia/recuperar", aptoCRUD, comentNecesario, capturaInactivar, vista.inacRecup_guardar);

// Vistas -  CRUD: Eliminar
router.get("/:familia/eliminar", aptoEliminar, capturaActivar, vista.inacRecupElim_form);
router.post("/:familia/eliminar", aptoEliminar, capturaInactivar, vista.elimina_guardar);

// Vistas -  CRUD: Eliminado
router.get("/:familia/eliminadoPorCreador", eliminadoPorCreador, vista.elimina_guardar);
router.get("/:familia/eliminado", vista.eliminado_form);

// Vistas - Revisión: Rechazo
router.get("/revision/:familia/rechazar", aptoCRUD, capturaActivar, vista.inactivarRechazar_form);
router.get("/revision/:familia/inactivar-o-recuperar", aptoCRUD, capturaActivar, vista.inacRecupElim_form);

// Fin
module.exports = router;
