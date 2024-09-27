"use strict";
// Variables
const router = express.Router();
const API = require("./RE-ControlAPI");
const vista = require("./RE-ControlVista");
const vistaRCLV = require("../2.2-RCLVs/RCLV-ControlVista");
const vistaFM = require("../2.0-Familias/FM-ControlVista");

// Middlewares particulares
const m = {
	// Específicos de usuarios
	usAltaTerm: require("../../middlewares/porUsuario/usAltaTerm"),
	usAptoInput: require("../../middlewares/porUsuario/usAptoInput"),
	usPenalizaciones: require("../../middlewares/porUsuario/usPenalizaciones"),
	usRolAutTablEnts: require("../../middlewares/porUsuario/usRolAutTablEnts"),
	usRolRevPERL: require("../../middlewares/porUsuario/usRolRevPERL"),
	usRolRevLinks: require("../../middlewares/porUsuario/usRolRevLinks"),

	// Específicos del registro
	entValida: require("../../middlewares/porRegistro/entidadValida"),
	iDvalido: require("../../middlewares/porRegistro/iDvalido"),
	linkAltaBaja: require("../../middlewares/porRegistro/linkAltaBaja"),
	rutaCRUD_ID: require("../../middlewares/varios/rutaCRUD_ID"),
	statusCorrecto: require("../../middlewares/porRegistro/statusCorrecto"),
	edicionAPI: require("../../middlewares/porRegistro/edicionAPI"),
	edicionVista: require("../../middlewares/porRegistro/edicionVista"),
	prodSinRclvAprob: require("../../middlewares/porRegistro/prodSinRclvAprob"),
	linksEnSemana: require("../../middlewares/porRegistro/linksEnSemana"),
	motivoNecesario: require("../../middlewares/porRegistro/motivoNecesario"),
	motivoOpcional: require("../../middlewares/porRegistro/motivoOpcional"),

	// Temas de captura
	permUserReg: require("../../middlewares/porRegistro/permUserReg"),
	capturaActivar: require("../../middlewares/varios/capturaActivar"),
	capturaInactivar: require("../../middlewares/varios/capturaInactivar"),

	// Middlewares - Otros
	multer: require("../../middlewares/varios/multer"),
};

// Middlewares - Consolidados
const usuarioBase = [m.usAltaTerm, m.usPenalizaciones];
const aptoUsuario = [...usuarioBase, m.usAptoInput];
const aptoCRUD = [m.entValida, m.iDvalido, m.statusCorrecto, ...usuarioBase, m.permUserReg];
const aptoEdicion = [...aptoCRUD, m.usRolRevPERL, m.edicionVista];

// APIs - Tablero
router.get("/api/actualiza-visibles", API.actualizaVisibles);

// APIs - Producto y RCLV
router.get("/api/edicion/motivo-generico", API.obtieneMotivoGenerico);
router.get("/api/edicion/aprob-rech", m.edicionAPI, API.edicAprobRech);

// APIs- Links
router.get("/api/link/alta-baja", m.linkAltaBaja, API.links.altaBaja);
//router.get("/api/link/eliminar", API.links.altaBaja);
router.get("/api/link/edicion", m.edicionAPI, API.edicAprobRech);
router.get("/api/link/siguiente-producto", API.links.sigProd);
router.get("/api/link/obtiene-embeded-link", API.links.obtieneEmbededLink);

// Vistas - Tablero de Control
router.get("/te", usuarioBase, m.usRolAutTablEnts, vista.tableroEntidades);
router.get("/tm", aptoUsuario, vista.tableroMantenim);

// Vistas - Altas
router.get("/agp/:entidad/:id", aptoCRUD, m.prodSinRclvAprob, m.capturaActivar, m.rutaCRUD_ID, vista.altaProdForm);
router.post("/agp/:entidad/:id", aptoCRUD, m.usRolRevPERL, m.prodSinRclvAprob, m.capturaInactivar, vista.cambioStatusGuardar); // Cambios de status
router.get("/agr/:entidad/:id", aptoCRUD, m.usRolRevPERL, m.capturaActivar, vistaRCLV.altaEdic.form);
router.post("/agr/:entidad/:id", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, m.multer.single("avatar"), vista.cambioStatusGuardar); // Cambios de status

// Vistas - Rechazar
router.get("/ch/:entidad/:id", aptoCRUD, m.capturaActivar, vistaFM.form.motivos);
router.post("/ch/:entidad/:id", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, m.motivoNecesario, vista.cambioStatusGuardar);

// Vistas - Revisar Inactivar
router.get("/in:siglaFam/:entidad/:id", aptoCRUD, m.capturaActivar, vistaFM.form.historial);
router.post("/in:siglaFam/:entidad/:id", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, vista.cambioStatusGuardar); // Va sin 'motivo'

// Vistas - Revisar Recuperar
router.get("/rc:siglaFam/:entidad/:id", aptoCRUD, m.capturaActivar, vistaFM.form.historial);
router.post("/rc:siglaFam/:entidad/:id", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, vista.cambioStatusGuardar); // Va sin 'motivo'

// Vistas - Solapamiento
router.get("/rsr/:entidad/:id", aptoCRUD, m.usRolRevPERL, m.capturaActivar, vistaRCLV.altaEdic.form);
router.post("/rsr/:entidad/:id", aptoCRUD, m.usRolRevPERL, m.multer.single("avatar"), m.capturaInactivar, vista.edic.solapam);

// Vistas - Edición
router.get("/ed:siglaFam/:entidad/:id", aptoEdicion, m.rutaCRUD_ID, m.capturaActivar, vista.edic.form);
router.post("/ed:siglaFam/:entidad/:id", aptoEdicion, m.motivoOpcional, m.capturaInactivar, vista.edic.avatar);

// Vistas - Links
router.get("/lkp", aptoCRUD, m.rutaCRUD_ID, m.linksEnSemana, m.usRolRevLinks, m.capturaActivar, vista.links);

// Fin
module.exports = router;
