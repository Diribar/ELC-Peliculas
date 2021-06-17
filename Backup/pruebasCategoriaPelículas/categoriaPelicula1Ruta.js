//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const prueba = require('./categoriaPelicula2Controller')

//**************************** Login ********************************
router.get('/', prueba.listado)

module.exports = router;
