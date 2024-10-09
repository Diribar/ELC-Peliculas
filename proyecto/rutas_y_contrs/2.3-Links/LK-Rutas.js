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
	linkAltaBaja: require("../../middlewares/porRegistro/linkAltaBaja"),

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
router.get("/api/lk-valida", API.valida);
router.get("/api/lk-obtiene-provs", API.obtieneProvs);
router.get("/api/lk-obtiene-embeded", API.obtieneEmbededLink);

// APIs - ABM
router.get("/api/lk-guardar", API.guarda);
router.get("/api/lk-inactiva-o-elimina", API.inactivaElimina);
router.get("/api/lk-recuperar", API.recupera);
router.get("/api/lk-deshacer", API.deshace);
router.get("/api/lk-alta-baja", m.linkAltaBaja, API.altaBaja);

// Vistas
router.get("/abm-links/p", aptoABM, m.capturaActivar, vista.abm);
router.get("/mirar/l", entIdValidos, vista.mirarLink);

// Fin
module.exports = router;
