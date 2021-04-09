//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const usuarios = require('../controladores/usuarios')

//************************ Middlewares ******************************
const validarMail = require('../../middlewares/US-validarMail');
const validarNombre = require('../../middlewares/US-validarNombre');
const validarSobrenombre = require('../../middlewares/US-validarSobrenombre');
const soloVisitas = require('../../middlewares/soloVisitas');
const soloUsuarios = require('../../middlewares/soloUsuarios');
const uploadFile = require('../../middlewares/multer');

//************************ Controladores ****************************
router.get('/registro-mail', soloVisitas, usuarios.altaFormMail)
router.post('/registro-mail', validarMail, usuarios.altaGuardarMail)

router.get('/redireccionar', usuarios.redireccionar)

router.get('/registro-nombre', soloUsuarios, usuarios.altaFormNombre)
router.post('/registro-nombre', validarNombre, usuarios.altaGuardarNombre)

router.get('/registro-sobrenombre', soloUsuarios, usuarios.altaFormSobrenombre)
router.post('/registro-sobrenombre', uploadFile.single('imagen'), validarSobrenombre, usuarios.altaGuardarSobrenombre)

router.get('/detalle', soloUsuarios, usuarios.detalle)          // Detalle
router.get('/editar', soloUsuarios, usuarios.editarForm)        // Modificar
router.put('/editar', uploadFile.single('imagen'), validarMail, validarSobrenombre, usuarios.editarGuardar)
router.delete('/eliminar', soloUsuarios, usuarios.baja)         // Baja

module.exports = router;
