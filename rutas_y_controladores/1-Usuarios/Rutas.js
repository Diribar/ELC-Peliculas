//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloVisitas = require("../../middlewares/usuarios/solo-0-visitas");
let soloUsuarios = require("../../middlewares/usuarios/solo-1-usuarios");
let uploadFile = require("../../middlewares/varios/multer");

//************************ Controladores ****************************
// Controladores de APIs
router.get("/api/validar-login", API.validarLogin);
router.get("/api/validar-mail", API.validarMail);
router.get("/api/validar-perennes", API.validarPerennes);
router.get("/api/validar-editables", API.validarEditables);

// Login
router.get("/login", soloVisitas, vista.loginForm);
router.post("/login", soloVisitas, vista.loginGuardar);
router.get("/logout", soloUsuarios, vista.logout);

// Controladores de Altas
router.get("/mail", soloVisitas, vista.altaMailForm);
router.post("/mail", soloVisitas, vista.altaMailGuardar);
router.get("/altaredireccionar", soloUsuarios, vista.altaRedireccionar);
router.get("/datos-perennes", soloUsuarios, vista.altaPerennesForm);
router.post("/datos-perennes", soloUsuarios, vista.altaPerennesGuardar);
router.get("/datos-editables", soloUsuarios, vista.altaEditablesForm);
router.post(
	"/datos-editables",
	soloUsuarios,
	uploadFile.single("avatar"),
	vista.altaEditablesGuardar
);

// Controladores de Consultas
router.get("/detalle", soloUsuarios, vista.detalle);
router.get("/edicion", soloUsuarios, vista.editarForm);
router.put("/edicion", soloUsuarios, uploadFile.single("avatar"), vista.editarGuardar); //Validar mail y editables
router.delete("/eliminar", soloUsuarios, vista.baja);

module.exports = router;
