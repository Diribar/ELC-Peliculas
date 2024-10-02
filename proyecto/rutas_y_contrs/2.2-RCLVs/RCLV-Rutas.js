"use strict";
// Variables
const router = express.Router();
const API = require("./RCLV-ControlAPI");
const vista = require("./RCLV-ControlVista");

// Middlewares
const m = {
	// Específicos de usuarios
	usAltaTerm: require("../../middlewares/porUsuario/usAltaTerm"),
	usPenalizaciones: require("../../middlewares/porUsuario/usPenalizaciones"),
	usAptoInput: require("../../middlewares/porUsuario/usAptoInput"),

	// Middlewares - Específicos del registro
	entValida: require("../../middlewares/porRegistro/entidadValida"),
	iDvalido: require("../../middlewares/porRegistro/iDvalido"),
	edicion: require("../../middlewares/porRegistro/edicionVista"),
	statusCorrecto: require("../../middlewares/porRegistro/statusCorrecto"),
	rclvNoEditable: require("../../middlewares/porRegistro/rclvNoEditable"),

	// Middlewares - Temas de captura
	permUserReg: require("../../middlewares/porRegistro/permUserReg"),
	capturaActivar: require("../../middlewares/varios/capturaActivar"),
	capturaInactivar: require("../../middlewares/varios/capturaInactivar"),

	// Middlewares - Otros
	multer: require("../../middlewares/varios/multer"),
};

// Middlewares - Consolidados
const aptoUsuario = [m.usAltaTerm, m.usPenalizaciones, m.usAptoInput];
const aptoAgregar = [m.entValida, ...aptoUsuario];
const aptoDetalle = [m.entValida, m.iDvalido, m.capturaInactivar];
const aptoCRUD = [m.entValida, m.iDvalido, m.statusCorrecto, ...aptoUsuario, m.permUserReg];
const aptoEdicion = [...aptoCRUD, m.edicion, m.rclvNoEditable];

// APIs - Detalle
router.get("/api/detalle/obtiene-variables", API.obtieneVars.detalle);

// APIs - Agregar/Editar
router.get("/api/edicion/obtiene-variables-rclv", API.obtieneVars.edicion);
router.get("/api/edicion/valida-sector", API.validaSector);
router.get("/api/edicion/registros-con-esa-fecha", API.registrosConEsaFecha);
router.get("/api/edicion/prefijos", API.prefijos);
router.get("/api/edicion/obtiene-leyenda-nombre", API.obtieneLeyNombre);

// Vistas - Relación con la vida
router.get("/agr", aptoAgregar, vista.altaEdic.form);
router.post("/agr", aptoAgregar, m.multer.single("avatar"), vista.altaEdic.guardar);
router.get("/dtr", aptoDetalle, vista.detalle);
router.get("/edr", aptoEdicion, m.capturaActivar, vista.altaEdic.form);
router.post("/edr", aptoEdicion, m.multer.single("avatar"), m.capturaInactivar, vista.altaEdic.guardar);

// Fin
module.exports = router;
