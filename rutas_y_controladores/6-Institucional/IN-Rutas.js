"use strict";
// Requires ************************************************
const router = express.Router();
const vista = require("./IN-ControlVista");

// Middlewares ***********************************************
const institucional = require("../../middlewares/varios/urlInstitDescon");

// Vistas *******************************************
// Vistas de vistas - Institucional
router.get("/:id", institucional, vista.institucional);

// Exportarlo **********************************************
module.exports = router;
