// ************ Requires ************
const fetch = require("node-fetch");

module.exports = async (ID) => {
	// PARTES DEL URL
	// "https://filmaffinity-unofficial.herokuapp.com/api/movie/136503?lang=ES"
	let A_prefijo = "https://filmaffinity-unofficial.herokuapp.com/api/movie/";
	let B_ID = ID;
	let C_sufijo = "?lang=ES";
	let url = A_prefijo + B_ID + C_sufijo;
	// BUSCAR LA INFO
	let resultado = {
		FA_id: ID,
		...await fetch(url).then((n) => n.json())
	} 
	return resultado;
};
