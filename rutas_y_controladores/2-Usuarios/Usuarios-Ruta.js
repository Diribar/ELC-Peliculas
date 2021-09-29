//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const usuariosController = require("./Usuarios-Controller");

//************************ Middlewares ******************************
const soloVisitas = require("../../middlewares/usuarios/soloVisitas");
const soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
const uploadFile = require("../../middlewares/varios/multer");

//************************ Controladores ****************************
// Controladores de APIs
router.get("/api/altaredireccionar", usuariosController.altaRedireccionar);

// Controladores de Altas
router.get('/altaredireccionar', usuariosController.altaRedireccionar)
router.get('/mail', soloVisitas, usuariosController.altaMailForm)
router.post('/mail', usuariosController.altaMailGuardar)
router.get('/datos-perennes', soloUsuarios, usuariosController.altaPerennesForm)
router.post('/datos-perennes', usuariosController.altaPerennesGuardar)
router.get('/datos-editables', soloUsuarios, usuariosController.altaEditablesForm)
router.post('/datos-editables', uploadFile.single('avatar'), usuariosController.altaEditablesGuardar)

// Controladores de Consultas
router.get('/detalle', soloUsuarios, usuariosController.detalle)          // Detalle
router.get('/editar', soloUsuarios, usuariosController.editarForm)        // Modificar
router.put('/editar', uploadFile.single('avatar'), usuariosController.editarGuardar)
router.delete('/eliminar', soloUsuarios, usuariosController.baja)         // Baja

module.exports = router;
