//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const usuariosController = require("./Usuarios-Controller");

//************************ Middlewares ******************************
const validarMail = require("../../middlewares/validarUserForms/validar1-Mail");
const validarPerennes = require("../../middlewares/validarUserForms/validar2-Perennes");
const validarEditables = require("../../middlewares/validarUserForms/validar3-Editables");
const soloVisitas = require("../../middlewares/usuarios/soloVisitas");
const soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
const uploadFile = require("../../middlewares/varios/multer");

//************************ Controladores ****************************
router.get('/altaredireccionar', usuariosController.altaRedireccionar)

router.get('/mail', soloVisitas, usuariosController.altaMailForm)
router.post('/mail', validarMail, usuariosController.altaMailGuardar)

router.get('/datos-perennes', soloUsuarios, usuariosController.altaPerennesForm)
router.post('/datos-perennes', validarPerennes, usuariosController.altaPerennesGuardar)

router.get('/datos-editables', soloUsuarios, usuariosController.altaEditablesForm)
router.post('/datos-editables', uploadFile.single('avatar'), validarEditables, usuariosController.altaEditablesGuardar)

router.get('/detalle', soloUsuarios, usuariosController.detalle)          // Detalle
router.get('/editar', soloUsuarios, usuariosController.editarForm)        // Modificar
router.put('/editar', uploadFile.single('avatar'), validarMail, validarEditables, usuariosController.editarGuardar)
router.delete('/eliminar', soloUsuarios, usuariosController.baja)         // Baja

module.exports = router;
