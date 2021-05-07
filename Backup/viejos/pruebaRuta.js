//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const prueba = require('../controladores/prueba')

//**************************** Login ********************************
router.get('/', prueba.listado)

module.exports = router;
