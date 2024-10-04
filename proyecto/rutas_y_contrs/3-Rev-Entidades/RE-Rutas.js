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
	idValido: require("../../middlewares/porRegistro/idValido"),
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
const aptoCRUD = [m.entValida, m.idValido, m.statusCorrecto, ...usuarioBase, m.permUserReg];
const aptoEdicion = [...aptoCRUD, m.usRolRevPERL, m.edicionVista];

// APIs - Tablero
router.get("/api/actualiza-visibles", API.actualizaVisibles);

// APIs - Producto y RCLV
router.get("/api/edicion/motivo-generico", API.obtieneMotivoGenerico);
router.get("/api/edicion/aprob-rech", m.edicionAPI, API.edicAprobRech);

// APIs- Links
router.get("/api/link/alta-baja", m.linkAltaBaja, API.links.altaBaja);
router.get("/api/link/edicion", m.edicionAPI, API.edicAprobRech);
router.get("/api/link/siguiente-producto", API.links.sigProd);
router.get("/api/link/obtiene-embeded-link", API.links.obtieneEmbededLink);

// Vistas - Tablero de Control
router.get("/tablero", usuarioBase, m.usRolAutTablEnts, vista.tableroControl);

// Vistas - Altas
router.get("/alta/p/:entidad", aptoCRUD, m.prodSinRclvAprob, m.capturaActivar, m.rutaCRUD_ID, vista.altaProdForm);
router.post("/alta/p/:entidad", aptoCRUD, m.usRolRevPERL, m.prodSinRclvAprob, m.capturaInactivar, vista.cambioStatusGuardar); // Cambios de status
router.get("/alta/r/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaActivar, vistaRCLV.altaEdic.form);
router.post("/alta/r/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, m.multer.single("avatar"), vista.cambioStatusGuardar); // Cambios de status

// Vistas - Edición
router.get("/edicion/:siglaFam/:entidad", aptoEdicion, m.rutaCRUD_ID, m.capturaActivar, vista.edic.form);
router.post("/edicion/:siglaFam/:entidad", aptoEdicion, m.motivoOpcional, m.capturaInactivar, vista.edic.avatar);

// Vistas - Rechazar
router.get("/rechazar/:siglaFam/:entidad", aptoCRUD, m.capturaActivar, vistaFM.form.motivos);
router.post("/rechazar/:siglaFam/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, m.motivoNecesario, vista.cambioStatusGuardar);

// Vistas - Revisar Inactivar
router.get("/inactivar/:siglaFam/:entidad", aptoCRUD, m.capturaActivar, vistaFM.form.historial);
router.post("/inactivar/:siglaFam/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, vista.cambioStatusGuardar); // Va sin 'motivo'

// Vistas - Revisar Recuperar
router.get("/recuperar/:siglaFam/:entidad", aptoCRUD, m.capturaActivar, vistaFM.form.historial);
router.post("/recuperar/:siglaFam/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, vista.cambioStatusGuardar); // Va sin 'motivo'

// Vistas - Solapamiento
router.get("/solapamiento/r/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaActivar, vistaRCLV.altaEdic.form);
router.post("/solapamiento/r/:entidad", aptoCRUD, m.usRolRevPERL, m.multer.single("avatar"), m.capturaInactivar, vista.edic.solapam);

// Vistas - Links
router.get("/abm-links/p/:entidad", aptoCRUD, m.rutaCRUD_ID, m.linksEnSemana, m.usRolRevLinks, m.capturaActivar, vista.links);

// Fin
module.exports = router;
