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

// Middlewares - Específicos de entidades
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const creadoPorUsuario = require("../../middlewares/filtrosPorRegistro/creadoPorUsuario");
const motivoNecesario = require("../../middlewares/filtrosPorRegistro/motivoNecesario");
const comentarioNeces = require("../../middlewares/filtrosPorRegistro/comentarioNeces");
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
router.get("/crud/api/motivos-status", API.motivosRechAltas);
router.get("/crud/api/actualiza-visibles", API.actualizarVisibles);

// Vistas - CRUD: Inactivar, Recuperar
router.get("/:familia/inactivar", aptoCRUD, capturaActivar, vista.inacRecupElimForm);
router.get("/:familia/recuperar", aptoCRUD, capturaActivar, vista.inacRecupElimForm);
router.post("/:familia/inactivar", aptoCRUD, motivoNecesario, comentarioNeces, capturaInactivar, vista.inacRecupGuardar);
router.post("/:familia/recuperar", aptoCRUD, comentarioNeces, capturaInactivar, vista.inacRecupGuardar);

// Vistas -  CRUD: Eliminar, Eliminado
router.get("/:familia/eliminar", aptoEliminar, capturaActivar, vista.inacRecupElimForm);
router.post("/:familia/eliminar", aptoEliminar, capturaInactivar, vista.eliminaGuardar);
router.get("/:familia/eliminadoPorCreador", eliminadoPorCreador, vista.eliminaGuardar);
router.get("/:familia/eliminado", vista.eliminado);

// Vistas - Revisión
router.get("/:familia/inactivar-o-recuperar", aptoCRUD, capturaActivar, vista.inacRecupElimForm);
router.get("/:familia/rechazo", aptoCRUD, capturaActivar, vista.inacRecupElimForm);

// Fin
module.exports = router;
