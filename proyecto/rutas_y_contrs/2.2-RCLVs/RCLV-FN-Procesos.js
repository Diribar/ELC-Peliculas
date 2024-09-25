"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");

module.exports = {
	actualizaProdsRCLV_conEdicionPropia: async (RCLV, usuario_id) => {
		// Si el usuario no está logueado, devuelve el RCLV intacto
		if (!usuario_id) return RCLV;

		// Actualiza los registros de productos
		for (let entProd of variables.entidades.prods) {
			// Si el RCLV no tiene productos de esa familia, saltea la rutina
			const prodsEnRCLV = RCLV[entProd];
			if (!prodsEnRCLV) continue;

			// Rutina por producto
			for (let i = 0; i < prodsEnRCLV.length; i++) {
				let [original, edicion] = await procsFM.obtieneOriginalEdicion({
					entidad: entProd,
					entId: prodsEnRCLV[i].id,
					usuario_id,
				});
				if (edicion) {
					const avatar = procsFM.obtieneAvatar(original, edicion).edic;
					RCLV[entProd][i] = {...original, ...edicion, avatar, id: original.id};
				}
			}
		}

		// Fin
		return RCLV;
	},
	altaEdicForm: {
		tipoFecha_id: (dataEntry, entidad) => {
			return false
				? false
				: dataEntry.fechaMovil
				? "FM"
				: dataEntry.fechaDelAno_id == 400
				? "SF"
				: dataEntry.fechaDelAno_id && dataEntry.fechaDelAno_id < 400
				? "FD"
				: entidad == "personajes" || entidad == "hechos"
				? "FD"
				: entidad == "eventos" || entidad == "epocasDelAno"
				? "FM"
				: entidad == "temas"
				? "SF"
				: "";
		},
		prioridad_id: (dataEntry, entidad) => {
			const prioridades = {menor: 1, estandar: 2, mayor: 3};
			return false
				? false
				: entidad == "personajes"
				? prioridades.estandar
				: entidad == "hechos"
				? dataEntry.soloCfc
					? prioridades.estandar
					: prioridades.menor
				: entidad == "temas"
				? prioridades.menor
				: entidad == "eventos"
				? dataEntry.soloCfc
					? prioridades.mayor
					: prioridades.menor
				: entidad == "epocasDelAno"
				? prioridades.menor
				: "";
		},
		opcsLeyNombre: (registro) => {
			// Variables
			const {nombre, nombreAltern, rolIglesia_id} = registro;
			let opciones = [];

			// Opciones para personajes
			if (registro.personajes) {
				// Nombre
				opciones.push(...opcsLeyNombrePers.consolidado(nombre, registro));
				// Nombre alternativo - se omite si no existe o si fue 'papa'
				if (nombreAltern && rolIglesia_id != "PP")
					opciones.push(...opcsLeyNombrePers.consolidado(nombreAltern, registro));
			}

			// Opciones para hechos
			else if (registro.hechos) {
				opciones.push(nombre);
				if (nombreAltern) opciones.push(nombreAltern);
			}

			// Ordena las opciones alfabéticamente
			opciones.sort((a, b) => (a < b ? -1 : 1));

			// Fin
			return opciones;
		},
		ayudas: (entidad) => {
			const nombre = ["personajes", "hechos"].includes(entidad)
				? [
						"El nombre <span>formal</span> es su nombre religioso (o civil si no tiene uno), sin títulos ni palabras ajenas a su nombre.",
						"El nombre <span>alternativo</span> es opcional, y se completa sólo si se lo/la conoce de otra manera.",
				  ]
				: [
						"Si vas a ingresar una Aparición Mariana, necesitamos que lo hagas con el formato: <em><b>Ap. Mar. - Guadalupe</b></em>, donde <em>Guadalupe</em> sería el lugar donde apareció o el nombre de la advocación.",
				  ];
			const fecha =
				entidad == "personajes"
					? [
							"Para los santos o beatos, se usa la fecha del santoral (Novus Ordo).",
							"Para los demás, suele ser la fecha de su muerte.",
					  ]
					: ["Si es un hecho sin una fecha definida, se usa aquella en la que comenzó a ocurrir"];
			const prioridad =
				entidad == "personajes"
					? ["Estándar", "Mayor importancia: Sagrada Familia, San José, María, Jesús"]
					: entidad == "hechos"
					? [
							"VPC: Menor Importancia",
							"CFC: Estándar",
							"Mayor importancia: algunos como Navidad, Bautismo de nuestro Señor, cada día de Semana Santa, Ascensión del Señor, Pentecostés",
					  ]
					: entidad == "temas"
					? ["Menor Importancia"]
					: entidad == "eventos"
					? ["VPC: Menor Importancia", "CFC: Mayor importancia"]
					: entidad == "epocasDelAno"
					? ["Menor Importancia", "Mayor importancia: algunas cortas como Semana Santa y Adviento"]
					: [""];
			const epoca =
				"Si transcurre durante varias épocas, desdoblá el hecho en varios, cada uno con su correspondiente época.";
			const ano = [
				"Se refiere al año en que " + (entidad == "personajes" ? "nació" : "ocurrió, o comenzó a ocurrir") + ".",
				"Si no lo encontrás, poné un valor estimado.",
			];

			// Fin
			return {nombre, fecha, prioridad, epoca, ano};
		},
	},
	altaEdicGuardar: {
		procesaLosDatos: (datos) => {
			// Variables
			const {tipoFecha, mes_id, dia, plural_id, entidad} = datos;
			let DE = {};

			// Obtiene los datos que se guardan en la tabla
			const campos = variables.camposRevisar.rclvs.filter((n) => n.rclvs || n[datos.entidad]).map((n) => n.nombre);
			for (let campo of campos) DE[campo] = datos[campo] ? datos[campo] : null;
			if (entidad == "personajes" && !DE.nombreAltern) DE.nombreAltern = "";

			// Variables con procesos
			DE.fechaDelAno_id = tipoFecha == "SF" ? 400 : fechasDelAno.find((n) => n.mes_id == mes_id && n.dia == dia).id;
			DE.fechaMovil = tipoFecha == "FM";
			DE.comentarioMovil = DE.fechaMovil ? DE.comentarioMovil : null;
			DE.anoFM = DE.fechaMovil ? Number(DE.anoFM) : null;
			if (DE.prioridad_id) DE.prioridad_id = Number(DE.prioridad_id);
			if (DE.genero_id)
				DE.genero_id =
					(typeof DE.genero_id == "string" ? DE.genero_id : Array.isArray(DE.genero_id) ? DE.genero_id.join("") : "") +
					(plural_id ? plural_id : "S");

			// Variables con procesos en personajes
			if (entidad == "personajes") {
				// Variables
				const CFC = DE.categoria_id == "CFC";
				const {epocaOcurrencia_id, anoNacim, rolIglesia_id, apMar_id} = datos;
				const epocaPosterior = epocaOcurrencia_id == "pst";

				// Variables con procesos
				DE.canon_id = CFC ? DE.canon_id : "NN";
				DE.anoNacim = epocaPosterior ? anoNacim : null;
				DE.rolIglesia_id = CFC ? rolIglesia_id : "NN";
				DE.apMar_id = CFC && epocaPosterior && parseInt(anoNacim) > 1100 ? apMar_id : 10; // El '10' es el id de "no presenció ninguna"
			}

			// Variables con procesos en hechos
			if (entidad == "hechos") {
				// Variables
				const {epocaOcurrencia_id, anoComienzo, soloCfc, ama} = datos;

				// Variables con procesos
				DE.anoComienzo = epocaOcurrencia_id == "pst" ? anoComienzo : null;
				DE.soloCfc = Number(soloCfc);
				DE.ama = soloCfc == "1" ? Number(ama) : 0;
			}

			// Fin
			return DE;
		},
		guardaLosCambios: async (req, res, DE) => {
			// Variables
			const {entidad, origen} = req.query;
			let {id} = req.query; // Si es un 'agregar', el 'id' es undefined
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const usuario_id = req.session.usuario.id;
			const codigo = req.baseUrl + req.path;
			let original, edicion, edicN;

			// Tareas para un nuevo registro
			if (codigo == "/rclv/agregar/") {
				// Guarda el nuevo registro
				DE.creadoPor_id = usuario_id;
				DE.statusSugeridoPor_id = usuario_id;
				original = await baseDeDatos.agregaRegistro(entidad, DE);
				id = original.id;

				// Les agrega el 'rclv_id' a session y cookie de origen
				if (origen == "PDA") {
					req.session.datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;
					req.session.datosAdics = {...req.session.datosAdics, [campo_id]: id};
					res.cookie("datosAdics", req.session.datosAdics, {maxAge: unDia});
				} else if (origen == "PED") {
					req.session.edicProd = req.session.edicProd ? req.session.edicProd : req.cookies.edicProd;
					req.session.edicProd = {...req.session.edicProd, [campo_id]: id};
					res.cookie("edicProd", req.session.edicProd, {maxAge: unDia});
				}
			}
			// Tareas para edición
			else if (codigo == "/rclv/edicion/") {
				// Obtiene el registro original
				original = await baseDeDatos.obtienePorId(entidad, id, ["statusRegistro", "ediciones"]);
				edicion = original.ediciones.find((n) => n[campo_id] == id && n.editadoPor_id == usuario_id);

				// Si es un registro propio y en status creado, actualiza el registro original
				if (original.creadoPor_id == usuario_id && original.statusRegistro_id == creado_id)
					await baseDeDatos.actualizaPorId(entidad, id, DE);
				// Si no esta en status 'creado', guarda la edición
				else edicN = await procsFM.guardaActEdic({entidad, original, edicion: {...edicion, ...DE}, usuario_id});
			}

			// Fin
			return {original, edicion, edicN};
		},
	},
};
let opcsLeyNombrePers = {
	consolidado: function (nombre, registro) {
		// Variables
		const {genero_id, rolIglesia_id} = registro;
		let opciones = [];
		const genero = generos.find((n) => n.id == genero_id);
		if (!genero) return [];

		// Canon
		if (rolIglesia_id != "PP") opciones.push(this.canonAlPrinc(nombre, registro, genero));
		opciones.push(...this.canonAlFinal(nombre, registro, genero));

		// Fin
		return opciones;
	},
	canonAlPrinc: function (nombre, registro, genero) {
		// Variables
		const {genero_id, canon_id} = registro;
		let canon = this.obtieneCanon(genero_id, canon_id);

		// Trabajo sobre 'canon'
		if (canon) {
			const primerNombre = nombre.split(" ")[0];
			if (canon == "santo" && !prefijosSanto.includes(primerNombre)) canon = "san"; // si corresponde, lo conmvierte en 'san'
			if (canon_id == "ST") canon = "a " + canon;
			else canon = (genero_id == "MS" ? "al" : "a " + genero.loLa) + " " + canon; // le agrega el artículo antes
			canon += " ";
		} else canon = "";

		// Fin
		return canon + nombre;
	},
	canonAlFinal: function (nombre, registro, genero) {
		// Variables
		const {genero_id, canon_id, rolIglesia_id} = registro;
		const canon = this.obtieneCanon(genero_id, canon_id, nombre);
		let opciones = [];
		let frase = "";

		// Singular
		frase += (rolIglesia_id == "PP" ? "al papa " : "a ") + nombre;
		if (frase.startsWith("a El ")) frase = frase.replace("a El ", "al ");
		if (frase.startsWith("a La ")) frase = frase.replace("a La ", "a la ");
		if (canon) frase += ", " + canon;
		opciones.push(frase);

		// Sacerdote
		if (rolIglesia_id == "SC") {
			frase = "al padre " + nombre;
			if (canon) frase += ", " + canon;
			opciones.push(frase);
		}

		// Apóstol
		if (rolIglesia_id == "AP") {
			frase = (!genero_id.includes("P") ? "al apóstol " : "a los apóstoles ") + nombre;
			if (canon) frase += ", " + canon;
			opciones.push(frase);
		}

		// Plural
		if (genero_id.includes("P")) {
			frase = "a " + genero.loLa + " " + nombre;
			if (canon) frase += ", " + canon;
			opciones.push(frase);
		}

		// Fin
		return opciones;
	},
	obtieneCanon: (genero_id, canon_id) => {
		// Obtiene el avance de su proceso de canonización
		let canon = canon_id && canon_id != "NN" ? canons.find((n) => n.id == canon_id)[genero_id] : null;

		// Pone en minúscula su primera letra
		if (canon) canon = canon.slice(0, 1).toLowerCase() + canon.slice(1);

		// Fin
		return canon;
	},
};
