"use strict";
//************************* Requires *******************************
const router = express.Router();
const API = require("./MS-ControlAPI");
const vista = require("./MS-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
// Varios
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");
const entidadRclv = require("../../middlewares/filtrosPorRegistro/entidadRclv");

//************************ Rutas ****************************
// Rutas de APIs
router.get("/api/quick-search/", API.quickSearch);
router.get("/api/horario-inicial/", API.horarioInicial);

// Rutas de vistas
// Inactivar captura
router.get("/inactivar-captura", capturaInactivar, vista.redirecciona);

// Tablero de mantenimiento
router.get("/mantenimiento", aptoUsuario, vista.tableroMantenim);

// Redireccionar a Inicio
router.get("/", vista.redireccionaInicio);
router.get("/inicio", vista.redireccionaInicio);

// Contenido de session y cookies
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Productos por RCLV
router.get("/:id", entidadRclv, vista.listadoRCLVs);

// Exportarlo **********************************************
module.exports = router;
