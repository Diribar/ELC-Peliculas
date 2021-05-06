// ************ Requires ************
const fetch = require('node-fetch');

// ************ Exportar ************
module.exports = async (req, res, next) => {
	let url = "https://restcountries.eu/rest/v2/all"
	let paises = await fetch(url).then(n => n.json())
	return paises
}
