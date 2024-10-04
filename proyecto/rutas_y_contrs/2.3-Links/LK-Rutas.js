"use strict";
// Variables
const router = express.Router();
const API = require("./LK-ControlAPI");
const vista = require("./LK-ControlVista");

// Middlewares
const m = {
	// Específicos de usuarios
	usAltaTerm: require("../../middlewares/porUsuario/usAltaTerm"),
	usPenalizaciones: require("../../middlewares/porUsuario/usPenalizaciones"),
	usAptoInput: require("../../middlewares/porUsuario/usAptoInput"),

	// Middlewares - Específicos del registro
	entValida: require("../../middlewares/porRegistro/entidadValida"),
	idValido: require("../../middlewares/porRegistro/idValido"),
	statusCorrecto: require("../../middlewares/porRegistro/statusCorrecto"),

	// Middlewares - Otros
	permUserReg: require("../../middlewares/porRegistro/permUserReg"),
	capturaActivar: require("../../middlewares/varios/capturaActivar"),
	rutaCRUD_ID: require("../../middlewares/varios/rutaCRUD_ID"),
};

// Middlewares - Consolidados
const aptoUsuario = [m.usAltaTerm, m.usPenalizaciones, m.usAptoInput];
const entIdValidos = [m.entValida, m.idValido];
const aptoABM = [...aptoUsuario, ...entIdValidos, m.statusCorrecto, m.permUserReg, m.rutaCRUD_ID];

// APIs - Links
router.get("/api/valida", API.valida);
router.get("/api/obtiene-provs-links", API.obtieneProvs);

// APIs - ABM
router.get("/api/guardar", API.guarda);
router.get("/api/inactiva-o-elimina", API.inactivaElimina);
router.get("/api/recuperar", API.recupera);
router.get("/api/deshacer", API.deshace);

// Vistas
router.get("/abm-links/p", aptoABM, m.capturaActivar, vista.abm);
router.get("/mirar/l", entIdValidos, vista.visualizacion);

// Fin
module.exports = router;
