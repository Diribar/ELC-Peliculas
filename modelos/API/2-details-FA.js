// ************ Requires ************
const API_key = "e90d1beb11c74cdf9852d97a354a6d45";
const fetch = require("node-fetch");

module.exports = async (ID) => {
	// PARTES DEL URL
	// "https://filmaffinity-unofficial.herokuapp.com/api/movie/136503?lang=ES"
	let A_prefijo = "https://filmaffinity-unofficial.herokuapp.com/api/movie/";
	let B_ID = ID;
	let C_sufijo = "?lang=ES";
	let url = A_prefijo + B_ID + C_sufijo;
	// BUSCAR LA INFO
	let resultado = await fetch(url).then((n) => n.json());
	return resultado;
};

// fetch("https://filmaffinity-unofficial.p.rapidapi.com/movie/detail/?lang=es&id=596059", {
// 	"method": "GET",
// 	"headers": {
// 		"x-rapidapi-key": "38160617ffmsh5c000753ddfbdacp171ef4jsne7960856af04",
// 		"x-rapidapi-host": "filmaffinity-unofficial.p.rapidapi.com"
// 	}
// })
// .then(response => {
// 	console.log(response);
// })
// .catch(err => {
// 	console.error(err);
// });