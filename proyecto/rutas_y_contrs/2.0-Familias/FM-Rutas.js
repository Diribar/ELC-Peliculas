"use strict";
// Variables
const router = express.Router();
const vista = require("./FM-ControlVista");
const API = require("./FM-ControlAPI");

// Middlewares
const m = {
	// Middlewares - Específicos de usuarios
	usAltaTerm: require("../../middlewares/porUsuario/usAltaTerm"),
	usPenalizaciones: require("../../middlewares/porUsuario/usPenalizaciones"),
	usAptoInput: require("../../middlewares/porUsuario/usAptoInput"),
	usRolRevPERL: require("../../middlewares/porUsuario/usRolRevPERL"),

	// Middlewares - Específicos del registro
	entValida: require("../../middlewares/porRegistro/entidadValida"),
	iDvalido: require("../../middlewares/porRegistro/iDvalido"),
	statusCorrecto: require("../../middlewares/porRegistro/statusCorrecto"),
	creadoPorUsuario: require("../../middlewares/porRegistro/creadoPorUsuario"),
	motivoNecesario: require("../../middlewares/porRegistro/motivoNecesario"),
	comentNecesario: require("../../middlewares/porRegistro/comentNecesario"),
	rutaCRUD_ID: require("../../middlewares/varios/rutaCRUD_ID"),
	statusCompara: require("../../middlewares/porRegistro/statusCompara"),

	// Middlewares - Temas de captura
	permUserReg: require("../../middlewares/porRegistro/permUserReg"),
	capturaActivar: require("../../middlewares/varios/capturaActivar"),
	capturaInactivar: require("../../middlewares/varios/capturaInactivar"),
};

// Middlewares - Consolidados
const aptoUsuario = [m.usAltaTerm, m.usPenalizaciones, m.usAptoInput];
const eliminadoPorCreador = [...aptoUsuario, m.entValida, m.iDvalido, m.statusCorrecto, m.creadoPorUsuario];
const aptoDetalle = [m.entValida, m.iDvalido, m.rutaCRUD_ID];
const aptoCRUD = [...aptoDetalle, m.statusCorrecto, m.statusCompara, ...aptoUsuario, m.permUserReg];
const aptoEliminar = [...aptoCRUD, m.usRolRevPERL];
const correcs = [m.entValida, m.iDvalido, m.statusCompara, aptoUsuario, m.permUserReg, m.usRolRevPERL];

// APIs
router.get("/crud/api/obtiene-col-cap", API.obtieneColCap);
router.get("/crud/api/obtiene-cap-ant-y-post", API.obtieneCapAntPostID);
router.get("/crud/api/obtiene-cap-id", API.obtieneCapID);
router.get("/crud/api/obtiene-capitulos", API.obtieneCapitulos);
router.get("/crud/api/obtiene-info-del-be", API.obtieneInfo);
router.get("/crud/api/obtiene-registro", API.obtieneRegistro);

// Vistas - Historial
router.get("/:entidad/historial", aptoDetalle, m.statusCompara, vista.form.historial);

// Vistas - Inactivar
router.get("/:entidad/inactivar", aptoCRUD, m.capturaActivar, vista.form.motivos);
router.post("/:entidad/inactivar", aptoCRUD, m.motivoNecesario, m.capturaInactivar, vista.inacRecupGuardar);

// Vistas - Recuperar
router.get("/:entidad/recuperar", aptoCRUD, m.capturaActivar, vista.form.historial);
router.post("/:entidad/recuperar", aptoCRUD, m.comentNecesario, m.capturaInactivar, vista.inacRecupGuardar);

// Vistas - Eliminar
router.get("/:entidad/eliminadoPorCreador", eliminadoPorCreador, vista.form.elimina);
router.get("/:entidad/eliminar", aptoEliminar, vista.form.elimina);

// Vistas - Correcciones
router.get("/correccion/motivo", correcs, m.statusCorrecto, m.capturaActivar, vista.correcs.motivoForm);
router.post("/correccion/motivo", correcs, m.statusCorrecto, m.motivoNecesario, m.capturaInactivar, vista.correcs.motivoGuardar);
router.get("/correccion/status", correcs, m.capturaActivar, vista.correcs.statusForm);
router.post("/correccion/status", correcs, m.capturaInactivar, vista.correcs.statusGuardar);

// Fin
module.exports = router;
