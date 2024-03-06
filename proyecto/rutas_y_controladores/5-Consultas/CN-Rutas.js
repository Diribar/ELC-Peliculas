"use strict";
// Variables
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// Middlewares - Específico de consultas
const consultas = require("../../middlewares/varios/consultas");

// API - Obtiene
router.get("/api/obtiene-la-configuracion-de-cabecera", API.obtiene.configCabecera);
router.get("/api/obtiene-la-configuracion-de-prefs", API.obtiene.configPrefs);
router.get("/api/obtiene-las-configs-posibles-para-el-usuario", API.obtiene.configsDeCabecera);
router.get("/api/obtiene-variables", API.obtiene.variables);

// API - Cambios en BD
router.get("/api/actualiza-en-usuario-configCons_id", API.cambiosEnBD.actualizaEnUsuarioConfigCons_id);
router.get("/api/crea-una-configuracion", API.cambiosEnBD.creaConfig);
router.get("/api/guarda-una-configuracion", API.cambiosEnBD.guardaConfig);
router.get("/api/elimina-configuracion-de-consulta", API.cambiosEnBD.eliminaConfigCons);

// API - Session y Cookie
router.get("/api/guarda-la-configuracion-en-cookie-y-session", API.sessionCookie.guardaConfig);
router.get("/api/elimina-la-configuracion-en-cookie-y-session", API.sessionCookie.eliminaConfig);

// API - Resultados
router.get("/api/obtiene-los-resultados", API.resultados);

// Vistas
router.get("/", consultas, vista.consultas);

// Fin
module.exports = router;
