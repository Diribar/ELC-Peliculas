//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const prueba = require('../controladores/usuarioPaisController')

//**************************** Login ********************************
router.get('/', prueba.listado)

module.exports = router;
