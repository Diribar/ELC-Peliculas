"use strict";
// Variables
const router = express.Router();
const API = require("./RCLV-ControlAPI");
const vista = require("./RCLV-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/porUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/porUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/porUsuario/usAptoInput");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/porRegistro/entidadValida");
const iDvalido = require("../../middlewares/porRegistro/iDvalido");
const edicion = require("../../middlewares/porRegistro/edicionVista");
const statusCorrecto = require("../../middlewares/porRegistro/statusCorrecto");
const rclvNoEditable = require("../../middlewares/porRegistro/rclvNoEditable");

// Middlewares - Temas de captura
const permUserReg = require("../../middlewares/porRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// Middlewares - Otros
const multer = require("../../middlewares/varios/multer");

// Middlewares - Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoAgregar = [entValida, ...aptoUsuario];
const aptoDetalle = [entValida, iDvalido, capturaInactivar];
const aptoCRUD = [entValida, iDvalido, statusCorrecto, ...aptoUsuario, permUserReg];
const aptoEdicion = [...aptoCRUD, edicion, rclvNoEditable];

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
router.post("/agr", aptoAgregar, multer.single("avatar"), vista.altaEdic.guardar);
router.get("/dtr/:id", aptoDetalle, vista.detalle);
router.get("/edr/:id", aptoEdicion, capturaActivar, vista.altaEdic.form);
router.post("/edr/:id", aptoEdicion, multer.single("avatar"), capturaInactivar, vista.altaEdic.guardar);

// Fin
module.exports = router;
