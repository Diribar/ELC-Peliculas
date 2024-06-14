"use strict";
// Variables
const router = express.Router();
const API = require("./RCLV-ControlAPI");
const vista = require("./RCLV-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const edicion = require("../../middlewares/filtrosPorRegistro/edicionVista");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const rclvNoEditable = require("../../middlewares/filtrosPorRegistro/rclvNoEditable");

// Middlewares - Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// Middlewares - Otros
const multer = require("../../middlewares/varios/multer");

// Middlewares - Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoAgregar = [entValida, ...aptoUsuario];
const aptoDetalle = [entValida, IDvalido, capturaInactivar];
const aptoCRUD = [entValida, IDvalido, statusCorrecto, ...aptoUsuario, permUserReg];
const aptoEdicion = [...aptoCRUD, edicion, rclvNoEditable];

// APIs - Detalle
router.get("/api/detalle/obtiene-variables", API.obtieneVars.detalle);

// APIs - Agregar/Editar
router.get("/api/edicion/obtiene-variables", API.obtieneVars.edicion);
router.get("/api/edicion/valida-sector", API.validaSector);
router.get("/api/edicion/registros-con-esa-fecha", API.registrosConEsaFecha);
router.get("/api/edicion/prefijos", API.prefijos);
router.get("/api/edicion/obtiene-leyenda-nombre", API.obtieneLeyNombre);

// Vistas - Relación con la vida
router.get("/agregar", aptoAgregar, vista.altaEdic.form);
router.post("/agregar", aptoAgregar, multer.single("avatar"), vista.altaEdic.guardar);
router.get("/edicion", aptoEdicion, capturaActivar, vista.altaEdic.form);
router.post("/edicion", aptoEdicion, multer.single("avatar"), capturaInactivar, vista.altaEdic.guardar);
router.get("/detalle", aptoDetalle, vista.detalle);

// Fin
module.exports = router;
