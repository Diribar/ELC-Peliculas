//************************* Requires *******************************
let express = require('express');
let router = express.Router();
let usuariosAPI = require("./Usuarios-API");
let usuariosController = require("./Usuarios-Controller");

//************************ Middlewares ******************************
let soloVisitas = require("../../middlewares/usuarios/soloVisitas");
let soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
let uploadFile = require("../../middlewares/varios/multer");

//************************ Controladores ****************************
// Controladores de APIs
router.get("/api/validarmail", usuariosAPI.validarMail);

// Controladores de Altas
router.get('/altaredireccionar', usuariosController.altaRedireccionar)
router.get('/mail', soloVisitas, usuariosController.altaMailForm)
router.post('/mail', usuariosController.altaMailGuardar)
router.get('/datos-perennes', soloUsuarios, usuariosController.altaPerennesForm)
router.post('/datos-perennes', usuariosController.altaPerennesGuardar)
router.get('/datos-editables', soloUsuarios, usuariosController.altaEditablesForm)
router.post('/datos-editables', uploadFile.single('avatar'), usuariosController.altaEditablesGuardar)

// Controladores de Consultas
router.get('/detalle', soloUsuarios, usuariosController.detalle)
router.get('/editar', soloUsuarios, usuariosController.editarForm)
router.put('/editar', uploadFile.single('avatar'), usuariosController.editarGuardar) //Validar mail y editables
router.delete('/eliminar', soloUsuarios, usuariosController.baja)

module.exports = router;
