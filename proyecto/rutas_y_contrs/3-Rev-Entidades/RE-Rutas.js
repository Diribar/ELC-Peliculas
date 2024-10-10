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
router.get("/api/re-actualiza-visibles", API.actualizaVisibles);

// APIs - Producto y RCLV
router.get("/api/re-motivo-generico", API.obtieneMotivoGenerico);
router.get("/api/re-edicion-aprob-rech", m.edicionAPI, API.edicAprobRech);

// APIs- Links
router.get("/api/re-edicion-link", m.edicionAPI, API.edicAprobRech);
router.get("/api/re-siguiente-producto-link", API.sigProdLinks);

// Vistas - Tablero de Control
router.get("/tablero", usuarioBase, m.usRolAutTablEnts, vista.tableroControl);

// Vistas - Altas
router.get("/alta/p/:entidad", aptoCRUD, m.prodSinRclvAprob, m.capturaActivar, m.rutaCRUD_ID, vista.form.altaProd);
router.post("/alta/p/:entidad", aptoCRUD, m.usRolRevPERL, m.prodSinRclvAprob, m.capturaInactivar, vista.guardar.cambioStatus); // Cambios de status
router.get("/alta/r/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaActivar, vistaRCLV.altaEdic.form);
router.post("/alta/r/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, m.multer.single("avatar"), vista.guardar.cambioStatus); // Cambios de status

// Vistas - Edición
router.get("/edicion/:entidad", aptoEdicion, m.rutaCRUD_ID, m.capturaActivar, vista.form.edicion);
router.post("/edicion/:entidad", aptoEdicion, m.motivoOpcional, m.capturaInactivar, vista.guardar.avatar);

// Vistas - Rechazar
router.get("/rechazar/:entidad", aptoCRUD, m.capturaActivar, vistaFM.form.motivos);
router.post("/rechazar/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, m.motivoNecesario, vista.guardar.cambioStatus);

// Vistas - Revisar Inactivar
router.get("/inactivar/:entidad", aptoCRUD, m.capturaActivar, vistaFM.form.historial);
router.post("/inactivar/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, vista.guardar.cambioStatus); // Va sin 'motivo'

// Vistas - Revisar Recuperar
router.get("/recuperar/:entidad", aptoCRUD, m.capturaActivar, vistaFM.form.historial);
router.post("/recuperar/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, vista.guardar.cambioStatus); // Va sin 'motivo'

// Vistas - Solapamiento
router.get("/solapamiento/r/:entidad", aptoCRUD, m.usRolRevPERL, m.capturaActivar, vistaRCLV.altaEdic.form);
router.post("/solapamiento/r/:entidad", aptoCRUD, m.usRolRevPERL, m.multer.single("avatar"), m.capturaInactivar, vista.guardar.solapam);

// Vistas - Links
router.get("/abm-links/p/:entidad", aptoCRUD, m.rutaCRUD_ID, m.linksEnSemana, m.usRolRevLinks, m.capturaActivar, vista.form.links);

// Fin
module.exports = router;
