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
router.get("/api/usuarios-clientes-acums", API.clientesAcums);
router.get("/api/peliculas-cfc-vpc", API.prodsCfcVpc);
router.get("/api/peliculas-publico", API.prodsPorPublico);
router.get("/api/peliculas-epoca-estreno", API.prodsPorEpocaEstr);
router.get("/api/rclvs-rangos-sin-efemerides", API.rclvsRangosSinEfems);
router.get("/api/links-vencimiento", API.linksVencim);
router.get("/api/links-por-proveedor", API.linksPorProv);

// Vistas
router.get("/usuarios-clientes-acums", combinados, vista.clientesAcums);
router.get("/peliculas-cfc-vpc", combinados, vista.prodsCfcVpc);
router.get("/peliculas-publico", combinados, vista.prodsPorPublico);
router.get("/peliculas-epoca-estreno", combinados, vista.prodsPorEpocaEstr);
router.get("/rclvs-rangos-sin-efemerides", combinados, vista.rclvsRangosSinEfems);
router.get("/links-vencimiento", combinados, vista.linksVencim);
router.get("/links-por-proveedor", combinados, vista.linksPorProv);

// Fin
module.exports = router;
