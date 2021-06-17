// ************ Requires ************
const path = require('path');

// ************ Funciones ************
const procesarDetalle  = require(path.join(__dirname, '/procesar1Detalle'));
const procesarPersonas  = require(path.join(__dirname, '/procesar2Personas'));

// ************ Exportar ************
module.exports = async (req, res, ID) => {
	// Conseguir los detalles y las personas
	let [detalle, Productoras, Productora_Peli, Paises, Pais_Peli] = await procesarDetalle(res, ID);
	let [Director, Director_Peli, Guion, Guion_Peli, Musica, Musica_Peli, Actores, Actor_Peli] = await procesarPersonas(ID);
	// Transferirle a la pelicula los datos importados
	cantActores = Math.min(10, Actores.length)
	let [productoras, paises, directores, guionistas, musicos, actores] = [[], [], [], [], [], []]
	for (let i = 0; i < Productoras.length; i++) {productoras.push(Productoras[i].nombre)}; productoras = productoras.join(", ")
	for (let i = 0; i < Paises.length; i++) {paises.push(Paises[i].nombre)}; paises = paises.join(", ")
	for (let i = 0; i < Director.length; i++) {directores.push(Director[i].nombre)}; directores = directores.join(", ")
	for (let i = 0; i < Guion.length; i++) {guionistas.push(Guion[i].nombre)}; guionistas = guionistas.join(", ")
	for (let i = 0; i < Musica.length; i++) {musicos.push(Musica[i].nombre)}; musicos = musicos.join(", ")
	for (let i = 0; i < cantActores; i++) {actores.push(Actores[i].nombre + " (" + Actor_Peli.find(n => n.actor_ID == Actores[i].actor_ID).personaje + ")")}; actores = actores.join(", ")
	req.body = {
		...detalle,
		productora: productoras,
		pais_origen: paises,
		direccion: directores,
		guion: guionistas,
		musica: musicos,
		reparto: actores
	};
}