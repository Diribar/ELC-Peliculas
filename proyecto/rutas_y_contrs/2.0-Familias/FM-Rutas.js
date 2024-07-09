"use strict";
// Variables
const router = express.Router();
const vista = require("./FM-ControlVista");
const API = require("./FM-ControlAPI");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/porUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/porUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/porUsuario/usAptoInput");
const usRolRevPERL = require("../../middlewares/porUsuario/usRolRevPERL");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/porRegistro/entidadValida");
const IDvalido = require("../../middlewares/porRegistro/IDvalido");
const statusCorrecto = require("../../middlewares/porRegistro/statusCorrecto");
const creadoPorUsuario = require("../../middlewares/porRegistro/creadoPorUsuario");
const motivoNecesario = require("../../middlewares/porRegistro/motivoNecesario");
const comentNecesario = require("../../middlewares/porRegistro/comentNecesario");
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");
const statusCompara = require("../../middlewares/porRegistro/statusCompara");

// Middlewares - Temas de captura
const permUserReg = require("../../middlewares/porRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// Middlewares - Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoDetalle = [entValida, IDvalido, rutaCRUD_ID];
const aptoCRUD = [...aptoDetalle, statusCorrecto, statusCompara, ...aptoUsuario, permUserReg];
const aptoEliminar = [...aptoCRUD, usRolRevPERL];
const eliminadoPorCreador = [...aptoUsuario, entValida, IDvalido, statusCorrecto, creadoPorUsuario];
const correcs = [entValida, IDvalido, statusCompara, aptoUsuario, permUserReg, usRolRevPERL];

// APIs
router.get("/crud/api/obtiene-col-cap", API.obtieneColCap);
router.get("/crud/api/obtiene-cap-ant-y-post", API.obtieneCapAntPostID);
router.get("/crud/api/obtiene-cap-id", API.obtieneCapID);
router.get("/crud/api/obtiene-capitulos", API.obtieneCapitulos);
router.get("/crud/api/motivos-status", API.statusMotivos);
router.get("/crud/api/obtiene-registro", API.obtieneRegistro);

// Vistas form - Motivos
router.get("/:familia/inactivar", aptoCRUD, capturaActivar, vista.motivosForm);
router.get("/revision/:familia/rechazar", aptoCRUD, capturaActivar, vista.motivosForm);

// Vistas form - Historial
router.get("/:familia/recuperar", aptoCRUD, capturaActivar, vista.historialForm);
router.get("/:familia/eliminar", aptoEliminar, capturaActivar, vista.historialForm);
router.get("/revision/:familia/inactivar", aptoCRUD, capturaActivar, vista.historialForm);
router.get("/revision/:familia/recuperar", aptoCRUD, capturaActivar, vista.historialForm);
router.get("/:familia/historial", aptoDetalle, statusCompara, vista.historialForm);

// Vistas -  CRUD: Eliminado
router.get("/:familia/eliminadoPorCreador", eliminadoPorCreador, vista.elimina_guardar);
router.get("/:familia/eliminado", vista.eliminado_form);

// Vistas post
router.post("/:familia/inactivar", aptoCRUD, motivoNecesario, capturaInactivar, vista.inacRecup_guardar);
router.post("/:familia/recuperar", aptoCRUD, comentNecesario, capturaInactivar, vista.inacRecup_guardar);
router.post("/:familia/eliminar", aptoEliminar, capturaInactivar, vista.elimina_guardar);

// Vistas - Correcciones
router.get("/correccion/motivo", correcs, statusCorrecto, capturaActivar, vista.correcs.motivoForm);
router.post("/correccion/motivo", correcs, statusCorrecto, motivoNecesario, capturaInactivar, vista.correcs.motivoGuardar);
router.get("/correccion/status", correcs, capturaActivar, vista.correcs.statusForm);
router.post("/correccion/status", correcs, capturaInactivar, vista.correcs.statusGuardar);

// Vistas -  Historial

// Fin
module.exports = router;
