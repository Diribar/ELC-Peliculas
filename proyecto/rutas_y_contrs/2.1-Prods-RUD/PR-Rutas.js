"use strict";
// Variables
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");

// Middlewares
const m = {
	// Específicos de usuarios
	usAltaTerm: require("../../middlewares/porUsuario/usAltaTerm"),
	usPenalizaciones: require("../../middlewares/porUsuario/usPenalizaciones"),
	usAptoInput: require("../../middlewares/porUsuario/usAptoInput"),

	// Middlewares - Específicos del registro
	entValida: require("../../middlewares/porRegistro/entidadValida"),
	idValido: require("../../middlewares/porRegistro/idValido"),
	rutaCRUD_ID: require("../../middlewares/varios/rutaCRUD_ID"),
	misDetalleProd: require("../../middlewares/varios/misDetalleProd"),
	edicion: require("../../middlewares/porRegistro/edicionVista"),
	statusCorrecto: require("../../middlewares/porRegistro/statusCorrecto"),

	// Middlewares - Temas de captura
	permUserReg: require("../../middlewares/porRegistro/permUserReg"),
	capturaActivar: require("../../middlewares/varios/capturaActivar"),
	capturaInactivar: require("../../middlewares/varios/capturaInactivar"),

	// Middlewares - Otros
	multer: require("../../middlewares/varios/multer"),
};

// Middlewares - Consolidados
const aptoDetalle = [m.entValida, m.idValido, m.rutaCRUD_ID];
const aptoUsuario = [m.usAltaTerm, m.usPenalizaciones, m.usAptoInput];
const aptoCalificar = [...aptoDetalle, m.statusCorrecto, ...aptoUsuario];
const aptoEdicion = [...aptoCalificar, m.permUserReg, m.edicion];

// API - Calificaciones
router.get("/api/obtiene-las-calificaciones", API.califics.delProducto);
router.get("/api/obtiene-la-calificacion-del-usuario", API.califics.delUsuarioProducto);
router.get("/api/elimina-la-calificacion-propia", API.califics.elimina);

// API - Preferencias por producto
router.get("/api/obtiene-opciones-de-preferencia", API.prefsDeCampo.obtieneOpciones);
router.get("/api/guarda-la-preferencia-del-usuario", API.prefsDeCampo.guardaLaPreferencia);

// API - Edición
router.get("/api/valida", API.edicion.valida);
router.get("/api/obtiene-original-y-edicion", API.edicion.obtieneVersionesProd);
router.get("/api/edicion/obtiene-variables-prod", API.edicion.variables);
router.get("/api/envia-a-req-session", API.edicion.envioParaSession);
router.get("/api/edicion/eliminar-nueva", API.edicion.eliminaNueva);
router.get("/api/edicion/eliminar-guardada", API.edicion.eliminaGuardada);

// Vistas
router.get("/detalle/p", aptoDetalle, m.misDetalleProd, m.capturaInactivar, vista.detalle);
router.get("/edicion/p", aptoEdicion, m.capturaActivar, vista.edicion.form);
router.post("/edicion/p", aptoEdicion, m.multer.single("avatar"), vista.edicion.guardar);
router.get("/calificar/p", aptoCalificar, vista.califica.form);
router.post("/calificar/p", aptoCalificar, vista.califica.guardar);

// Fin
module.exports = router;
