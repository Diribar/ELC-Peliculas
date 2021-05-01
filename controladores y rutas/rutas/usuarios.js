//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const usuarios = require('../controladores/usuarios')

//************************ Middlewares ******************************
const validarMail = require('../../middlewares/usuarios/validar1-Mail');
const validarPerennes = require('../../middlewares/usuarios/validar2-Perennes');
const validarEditables = require('../../middlewares/usuarios/validar3-Editables');
const soloVisitas = require('../../middlewares/usuarios/soloVisitas');
const soloUsuarios = require('../../middlewares/usuarios/soloUsuarios');
const uploadFile = require('../../middlewares/varios/multer');

//************************ Controladores ****************************
router.get('/registro-mail', soloVisitas, usuarios.altaMailForm)
router.post('/registro-mail', validarMail, usuarios.altaMailGuardar)

router.get('/redireccionar', usuarios.redireccionar)

router.get('/registro-datos-perennes', soloUsuarios, usuarios.altaPerennesForm)
router.post('/registro-datos-perennes', validarPerennes, usuarios.altaPerennesGuardar)

router.get('/registro-sobrenombre', soloUsuarios, usuarios.altaFormSobrenombre)
router.post('/registro-sobrenombre', uploadFile.single('imagen'), validarEditables, usuarios.altaGuardarSobrenombre)

router.get('/detalle', soloUsuarios, usuarios.detalle)          // Detalle
router.get('/editar', soloUsuarios, usuarios.editarForm)        // Modificar
router.put('/editar', uploadFile.single('imagen'), validarMail, validarEditables, usuarios.editarGuardar)
router.delete('/eliminar', soloUsuarios, usuarios.baja)         // Baja

module.exports = router;
