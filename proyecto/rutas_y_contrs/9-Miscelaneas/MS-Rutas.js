"use strict";
// Variables
const router = express.Router();
const API = require("./MS-ControlAPI");
const vista = require("./MS-ControlVista");

// Middlewares de usuarios
const usAltaTerm= require("../../middlewares/porUsuario/usAltaTerm");
const usAptoInput= require("../../middlewares/porUsuario/usAptoInput");
const usPenalizaciones= require("../../middlewares/porUsuario/usPenalizaciones");

// Middlewares - Varios
const entValida = require("../../middlewares/porRegistro/entidadValida");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// Middlewares - Consolidado
const aptoUsuario = [usAltaTerm, usAptoInput, usPenalizaciones];

// APIs
router.get("/api/horario-inicial/", API.horarioInicial);
router.get("/api/busqueda-rapida/", API.busquedaRapida);

// Vista
router.get("/", vista.inicio);
router.get("/tablero-de-mantenimiento", aptoUsuario, vista.tableroMantenim);

// Redireciona
router.get("/inicio", vista.redirecciona.inicio);
router.get("/:entidad/inactivar-captura", entValida, capturaInactivar, vista.redirecciona.urlDeDestino); // inactivar captura

// Información para mostrar en el explorador
router.get("/session", vista.listados.session);
router.get("/cookies", vista.listados.cookies);
router.get("/listados/links", vista.listados.links); // busca las películas con más cantidad de links

// Fin
module.exports = router;
