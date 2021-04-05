//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const usuarios = require('../controladores/usuarios')

//************************ Middlewares ******************************
const validarMail = require('../../middlewares/validarMail');    // Validar mail y contraseña
const validarNombre = require('../../middlewares/validarNombre');    // Validar mail y contraseña
const validarSobrenombre = require('../../middlewares/validarSobrenombre');    // Validar mail y contraseña
const soloVisitas = require('../../middlewares/soloVisitas');  // Para prevenir ciertos accesos cuando SI está logueado
const soloUsuarios = require('../../middlewares/soloUsuarios');  // Para prevenir ciertos accesos cuando NO está logueado
const uploadFile = require('../../middlewares/multer');            // Para usar archivos en formularios 

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
