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
	idValido: require("../../middlewares/porRegistro/idValido"),
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
const aptoDetalle = [m.entValida, m.idValido, m.capturaInactivar];
const aptoCRUD = [m.entValida, m.idValido, m.statusCorrecto, ...aptoUsuario, m.permUserReg];
const aptoEdicion = [...aptoCRUD, m.edicion, m.rclvNoEditable];

// APIs - Detalle
router.get("/api/rc-obtiene-variables-detalle", API.obtieneVars.detalle);

// APIs - Agregar/Editar
router.get("/api/rc-obtiene-variables-edicion", API.obtieneVars.edicion);
router.get("/api/rc-valida-sector-edicion", API.validaSector);
router.get("/api/rc-registros-con-esa-fecha", API.registrosConEsaFecha);
router.get("/api/rc-prefijos", API.prefijos);
router.get("/api/rc-obtiene-leyenda-nombre", API.obtieneLeyNombre);

// Vistas - Relación con la vida
router.get("/agregar/r", aptoAgregar, vista.altaEdic.form);
router.post("/agregar/r", aptoAgregar, m.multer.single("avatar"), vista.altaEdic.guardar);
router.get("/detalle/r", aptoDetalle, vista.detalle);
router.get("/edicion/r", aptoEdicion, m.capturaActivar, vista.altaEdic.form);
router.post("/edicion/r", aptoEdicion, m.multer.single("avatar"), m.capturaInactivar, vista.altaEdic.guardar);
router.get("/productos-por-registro/r", m.entValida, vista.prodsPorReg); // busca los rclvs con más cantidad de productos

// Fin
module.exports = router;
