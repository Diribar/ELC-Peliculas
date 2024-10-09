"use strict";
// Variables
const router = express.Router();
const API = require("./GR-ControlAPI");
const vista = require("./GR-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/porUsuario/usAltaTerm");
const usRolAutTablEnts = require("../../middlewares/porUsuario/usRolAutTablEnts");
const combinados = [usAltaTerm, usRolAutTablEnts];

// API
router.get("/api/gr-usuarios-clientes-acums", API.navegsAcums);
router.get("/api/gr-peliculas-cfc-vpc", API.prodsCfcVpc);
router.get("/api/gr-peliculas-publico", API.prodsPorPublico);
router.get("/api/gr-peliculas-epoca-estreno", API.prodsPorEpocaEstr);
router.get("/api/gr-rclvs-rangos-sin-efemerides", API.rclvsRangosSinEfems);
router.get("/api/gr-vencimiento-de-links", API.linksVencim);
router.get("/api/gr-links-por-proveedor", API.linksPorProv);

// Vistas
router.get("/usuarios-clientes-acums", combinados, vista.navegsAcums);
router.get("/peliculas-cfc-vpc", combinados, vista.prodsCfcVpc);
router.get("/peliculas-publico", combinados, vista.prodsPorPublico);
router.get("/peliculas-epoca-estreno", combinados, vista.prodsPorEpocaEstr);
router.get("/rclvs-rangos-sin-efemerides", combinados, vista.rclvsRangosSinEfems);
router.get("/vencimiento-de-links", combinados, vista.linksVencim);
router.get("/links-por-proveedor", combinados, vista.linksPorProv);

// Fin
module.exports = router;
