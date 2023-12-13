"use strict";
// Variables
const router = express.Router();
const vista = require("./IN-ControlVista");

// Middlewares
const institucional = require("../../middlewares/varios/urlInstitDescon");

// Vistas
router.get("/:id", institucional, vista.institucional); // institucional

// Fin
module.exports = router;
