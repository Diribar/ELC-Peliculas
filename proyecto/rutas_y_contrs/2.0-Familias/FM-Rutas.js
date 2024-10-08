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
	idValido: require("../../middlewares/porRegistro/idValido"),
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
const eliminadoPorCreador = [...aptoUsuario, m.entValida, m.idValido, m.statusCorrecto, m.creadoPorUsuario];
const aptoDetalle = [m.entValida, m.idValido, m.rutaCRUD_ID];
const aptoCRUD = [...aptoDetalle, m.statusCorrecto, m.statusCompara, ...aptoUsuario, m.permUserReg];
const aptoEliminar = [...aptoCRUD, m.usRolRevPERL];
const correcs = [m.entValida, m.idValido, m.statusCompara, aptoUsuario, m.permUserReg, m.usRolRevPERL];

// APIs
router.get("/api/obtiene-info-del-be-familia", API.obtieneInfo);
router.get("/api/obtiene-registro", API.obtieneRegistro);

// Vistas - Historial
router.get("/historial", aptoDetalle, m.statusCompara, vista.form.historial);

// Vistas - Inactivar
router.get("/inactivar", aptoCRUD, m.capturaActivar, vista.form.motivos);
router.post("/inactivar", aptoCRUD, m.motivoNecesario, m.capturaInactivar, vista.inacRecupGuardar);

// Vistas - Recuperar
router.get("/recuperar", aptoCRUD, m.capturaActivar, vista.form.historial);
router.post("/recuperar", aptoCRUD, m.comentNecesario, m.capturaInactivar, vista.inacRecupGuardar);

// Vistas - Elimina
router.get("/eliminado-por-creador", eliminadoPorCreador, vista.form.elimina);
router.get("/eliminado", aptoEliminar, vista.form.elimina);

// Vistas - Correcciones
router.get("/correccion-del-motivo", correcs, m.capturaActivar, m.statusCorrecto, vista.correcs.motivoForm);
router.post("/correccion-del-motivo", correcs, m.capturaInactivar, m.statusCorrecto, m.motivoNecesario, vista.correcs.motivoGuardar);
router.get("/correccion-del-status", correcs, m.capturaActivar, vista.correcs.statusForm);
router.post("/correccion-del-status", correcs, m.capturaInactivar, vista.correcs.statusGuardar);

// Fin
module.exports = router;
