//************************* Requires *******************************
let express = require('express');
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloVisitas = require("../../middlewares/usuarios/soloVisitas");
let soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
let uploadFile = require("../../middlewares/varios/multer");

//************************ Controladores ****************************
// Controladores de APIs
router.get("/api/validarlogin", API.validarLogin);
router.get("/api/validarmail", API.validarMail);
router.get("/api/validarperennes", API.validarPerennes);
router.get("/api/validareditables", API.validarEditables);

// Login
router.get("/login", soloVisitas, vista.loginForm);
router.post("/login", soloVisitas, vista.loginGuardar);
router.get("/logout", soloUsuarios, vista.logout);

// Controladores de Altas
router.get('/altaredireccionar', vista.altaRedireccionar)
router.get('/mail', soloVisitas, vista.altaMailForm)
router.post('/mail', vista.altaMailGuardar)
router.get('/datos-perennes', soloUsuarios, vista.altaPerennesForm)
router.post('/datos-perennes', vista.altaPerennesGuardar)
router.get('/datos-editables', soloUsuarios, vista.altaEditablesForm)
router.post('/datos-editables', uploadFile.single('avatar'), vista.altaEditablesGuardar)

// Controladores de Consultas
router.get('/detalle', soloUsuarios, vista.detalle)
router.get('/editar', soloUsuarios, vista.editarForm)
router.put('/editar', uploadFile.single('avatar'), vista.editarGuardar) //Validar mail y editables
router.delete('/eliminar', soloUsuarios, vista.baja)

module.exports = router;
