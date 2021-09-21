const fetch = require('node-fetch');

module.exports = {
	listado: async (req, res) => {
		let url = "https://restcountries.eu/rest/v2/all"
		let paises = await fetch(url).then(n => n.json())
		// return res.send(paises)
		return res.render('paisesVista', {paises});
	}
}