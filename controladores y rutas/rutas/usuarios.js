//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const usuariosController = require('../controladores/usuarios')

//************************ Middlewares ******************************
const validarMail = require('../../middlewares/usuarios/validar1-Mail');
const validarPerennes = require('../../middlewares/usuarios/validar2-Perennes');
const validarEditables = require('../../middlewares/usuarios/validar3-Editables');
const soloVisitas = require('../../middlewares/usuarios/soloVisitas');
const soloUsuarios = require('../../middlewares/usuarios/soloUsuarios');
const uploadFile = require('../../middlewares/varios/multer');

//************************ Controladores ****************************
router.get('/registro-mail', soloVisitas, usuariosController.altaMailForm)
router.post('/registro-mail', validarMail, usuariosController.altaMailGuardar)

router.get('/redireccionar', usuariosController.redireccionar)

router.get('/registro-datos-perennes', soloUsuarios, usuariosController.altaPerennesForm)
router.post('/registro-datos-perennes', validarPerennes, usuariosController.altaPerennesGuardar)

router.get('/registro-datos-editables', soloUsuarios, usuariosController.altaEditablesForm)
router.post('/registro-datos-editables', uploadFile.single('avatar'), validarEditables, usuariosController.altaEditablesGuardar)

router.get('/detalle', soloUsuarios, usuariosController.detalle)          // Detalle
router.get('/editar', soloUsuarios, usuariosController.editarForm)        // Modificar
router.put('/editar', uploadFile.single('imagen'), validarMail, validarEditables, usuariosController.editarGuardar)
router.delete('/eliminar', soloUsuarios, usuariosController.baja)         // Baja

module.exports = router;
