//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const paises = require('../controladores/paises')

router.get('/', paises.listado)

module.exports = router;
