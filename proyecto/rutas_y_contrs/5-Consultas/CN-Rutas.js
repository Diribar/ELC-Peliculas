"use strict";
// Variables
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// Middlewares - Específico de consultas
const consultas = require("../../middlewares/varios/consultas");

// API - Obtiene
router.get("/api/cn-obtiene-la-cabecera", API.obtiene.cabecera);
router.get("/api/cn-obtiene-las-preferencias", API.obtiene.preferencias);
router.get("/api/cn-obtiene-las-cabeceras-posibles-para-el-usuario", API.obtiene.cabecerasPosibles);
router.get("/api/cn-obtiene-variables", API.obtiene.variables);

// API - Cambios en BD
router.get("/api/cn-actualiza-en-usuario-configCons_id", API.cambiosEnBD.actualizaEnUsuarioConfigCons_id);
router.get("/api/cn-crea-una-configuracion", API.cambiosEnBD.creaConfig);
router.get("/api/cn-guarda-una-configuracion", API.cambiosEnBD.guardaConfig);
router.get("/api/cn-elimina-configuracion-de-consulta", API.cambiosEnBD.eliminaConfig);

// API - Session y Cookie
router.get("/api/cn-guarda-la-configuracion-en-session-y-cookie", API.sessionCookie.guardaConfig);
router.get("/api/cn-elimina-la-configuracion-en-session-y-cookie", API.sessionCookie.eliminaConfig);

// API - Resultados
router.get("/api/cn-obtiene-los-resultados", API.resultados);

// Vistas
router.get("/", consultas, vista.consultas);

// Fin
module.exports = router;
