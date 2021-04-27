//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const listado = require('../controladores/listado')

router.get('/', listado.listado)

module.exports = router;
