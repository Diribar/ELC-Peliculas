"use strict";
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Vistas - Data entry
router.get("/palabras-clave", vistaMS.redirecciona.rutasAntiguas);
router.get("/desambiguar", vistaMS.redirecciona.rutasAntiguas);
router.get("/ingreso-manual", vistaMS.redirecciona.rutasAntiguas);
router.get("/:todosLosDemas", vistaMS.redirecciona.rutasAntiguas);

module.exports = router;
