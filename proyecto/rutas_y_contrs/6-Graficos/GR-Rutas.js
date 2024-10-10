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
for (let codigo in graficos) router.get("/api/gr-" + graficos[codigo].url, API[codigo]);

// Vistas
for (let codigo in graficos) router.get("/api/" + graficos[codigo].url, vista[codigo]);

// Fin
module.exports = router;
