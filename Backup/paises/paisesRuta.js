//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const paises = require('../controladores/paisesController')

router.get('/', paises.listado)

module.exports = router;
