const fetch = require('node-fetch');

fetch("https://restcountries.eu/rest/v2/all")
	.then(n => n.json())
	.then(n => {
		console.log (n)
	})
return paises
for (n of paises) {
	listado += n.alpha2Code + "/" + n.name + "/" + n.region +"@"
}
console.log (listado)