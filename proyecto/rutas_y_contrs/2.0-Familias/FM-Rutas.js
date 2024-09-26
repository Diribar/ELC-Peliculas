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
router.get("/:entidad/hs/:id", aptoDetalle, m.statusCompara, vista.form.historial);

// Vistas - Inactivar
router.get("/:entidad/in/:id", aptoCRUD, m.capturaActivar, vista.form.motivos);
router.post("/:entidad/in/:id", aptoCRUD, m.motivoNecesario, m.capturaInactivar, vista.inacRecupGuardar);

// Vistas - Recuperar
router.get("/:entidad/rc/:id", aptoCRUD, m.capturaActivar, vista.form.historial);
router.post("/:entidad/rc/:id", aptoCRUD, m.comentNecesario, m.capturaInactivar, vista.inacRecupGuardar);

// Vistas - Eliminar
router.get("/:entidad/ec:siglaFam/:id", eliminadoPorCreador, vista.form.elimina);
router.get("/:entidad/el:siglaFam/:id", aptoEliminar, vista.form.elimina);

// Vistas - Correcciones
router.get("/:entidad/cm/:id", correcs, m.capturaActivar, m.statusCorrecto, vista.correcs.motivoForm);
router.post("/:entidad/cm/:id", correcs, m.capturaInactivar, m.statusCorrecto, m.motivoNecesario, vista.correcs.motivoGuardar);
router.get("/:entidad/cs/:id", correcs, m.capturaActivar, vista.correcs.statusForm);
router.post("/:entidad/cs/:id", correcs, m.capturaInactivar, vista.correcs.statusGuardar);

// Fin
module.exports = router;
