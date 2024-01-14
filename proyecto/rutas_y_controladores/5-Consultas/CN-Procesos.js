"use strict";
// Variables

module.exports = {
	configs: {
		cabecera: async (userID) => {
			// Obtiene los filtros personalizados propios y los provistos por ELC
			const usuario_id = userID ? [1, userID] : 1;
			const configsDeCabecera = await BD_genericas.obtieneTodosPorCondicion("configsCons", {usuario_id});

			// Los ordena alfabéticamente
			configsDeCabecera.sort((a, b) => (a.nombre < b.nombre ? -1 : 1));

			// Fin
			return configsDeCabecera;
		},
		campos: function () {
			// Variable 'filtros'
			let campos = {...variables.camposConsultas};

			// Agrega los campos de código y opciones
			for (let campo in campos) {
				// Le agrega el nombre del campo a cada método
				campos[campo].codigo = campo;

				// Si no tiene opciones, le agrega las de la BD
				if (!campos[campo].opciones) {
					// Si es el campo 'epocasOcurrencia', quita la opción 'varias'
					if (campo == "epocasOcurrencia")
						campos.epocasOcurrencia.opciones = epocasOcurrencia
							.filter((n) => n.id != "var")
							.map((n) => ({id: n.id, nombre: n.consulta}));
					else campos[campo].opciones = global[campo];
				}
			}

			// Fin
			return campos;
		},
	},
	resultados: {
		obtieneProds: async function (configCons) {
			// Variables
			const {entidad, opcion} = configCons;
			const campo_id = !["productos", "rclvs"].includes(entidad) ? comp.obtieneDesdeEntidad.campo_id(entidad) : null;
			const entsProd = opcion.caps ? ["peliculas", "colecciones", "capitulos"] : ["peliculas", "colecciones"];
			let productos = [];
			let resultados = [];

			// Includes
			let include = [];
			if (!opcion.codigo.startsWith("fechaDelAno")) include.push(...variables.asocs.rclvs);
			if (opcion.codigo == "anoEstreno") include.push("epocaEstreno");
			if (opcion.codigo == "anoOcurrencia") include.push("epocaOcurrencia");

			// Condiciones
			const prefs = this.prefs.prods(configCons);
			let condiciones = {statusRegistro_id: aprobados_ids, ...prefs};
			if (["calificacion", "misCalificadas"].includes(opcion.codigo)) condiciones.calificacion = {[Op.ne]: null}; // Para la opción 'calificación', agrega pautas en las condiciones
			if (campo_id) condiciones[campo_id] = {[Op.ne]: 1}; // Si son productos de RCLVs, el 'campo_id' debe ser distinto a 'uno'

			// Obtiene los productos
			for (let entProd of entsProd)
				productos.push(
					BD_genericas.obtieneTodosPorCondicionConInclude(entProd, condiciones, include).then((n) =>
						n.map((m) => ({...m, entidad: entProd}))
					)
				);
			await Promise.all(productos).then((n) => n.map((m) => resultados.push(...m)));

			// Aplica otros filtros
			if (resultados.length) resultados = this.prefs.otrosFiltros({resultados, configCons, campo_id});

			// Fin
			return resultados;
		},
		obtieneRclvs: async function (configCons) {
			// Interrumpe la función
			if (configCons.entidad == "productos") return null;

			// Variables
			const {entidad} = configCons;
			let rclvs = [];

			// Obtiene los RCLVs
			if (entidad == "rclvs") {
				// Variables
				let aux = [];

				// Rutina por RCLV
				for (let rclvEnt of variables.entidades.rclvs) {
					// Obtiene los registros
					const {condiciones, include} = this.obtieneIncludeCondics(rclvEnt, configCons);
					aux.push(
						BD_genericas.obtieneTodosPorCondicionConInclude(rclvEnt, condiciones, include)
							.then((n) => n.filter((m) => m.peliculas.length || m.colecciones.length || m.capitulos.length))
							.then((n) => n.map((m) => ({...m, entidad: rclvEnt})))
					);
				}
				await Promise.all(aux).then((n) => n.map((m) => rclvs.push(...m)));
			}

			// Rutina por RCLV
			else {
				const {condiciones, include} = this.obtieneIncludeCondics(entidad, configCons);
				rclvs = await BD_genericas.obtieneTodosPorCondicionConInclude(entidad, condiciones, include)
					.then((n) => n.filter((m) => m.peliculas.length || m.colecciones.length || m.capitulos.length))
					.then((n) => n.map((m) => ({...m, entidad})));
			}

			// Fin
			return rclvs;
		},
		obtieneIncludeCondics: function (entidad, configCons) {
			// Include
			let include = [...variables.entidades.prods];
			if (["personajes", "hechos"].includes(entidad)) include.push("epocaOcurrencia");
			if (entidad == "personajes") include.push("rolIglesia", "canon");

			// Obtiene las condiciones
			const prefs = ["personajes", "hechos"].includes(entidad) ? this.prefs.rclvs(configCons) : null;
			const condiciones = {statusRegistro_id: aprobado_id, id: {[Op.gt]: 10}, ...prefs}; // Status aprobado e ID mayor a 10

			// Fin
			return {include, condiciones};
		},
		obtienePorFechaDelAno: async (configCons) => {
			// Variables
			const {entidad, dia, mes} = configCons;
			const entidadesRCLV = entidad != "rclvs" ? [entidad] : variables.entidades.rclvs;
			const diaHoy = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes);
			const inclStd = ["fechaDelAno"];
			const inclHec = [...inclStd, "epocaOcurrencia"];
			const inclPers = [...inclHec, "rolIglesia", "canon"];
			let registros = [];
			let rclvs = [];

			// Rutina para obtener los RCLVs
			for (let entidadRCLV of entidadesRCLV) {
				// Variables
				const condicion = {statusRegistro_id: aprobado_id, fechaDelAno_id: {[Op.ne]: 400}};
				const includes = entidadRCLV == "hechos" ? inclHec : entidadRCLV == "personajes" ? inclPers : inclStd;

				// Obtiene los registros y les agrega la entidadRCLV
				registros.push(
					BD_genericas.obtieneTodosPorCondicionConInclude(entidadRCLV, condicion, includes).then((n) =>
						n.map((m) => ({...m, entidad: entidadRCLV}))
					)
				);
			}
			await Promise.all(registros).then((n) => n.map((m) => rclvs.push(...m)));

			// Se fija si debe reemplazar la fechaDelAno_id de un registro 'epocaDelAno' con el día actual
			const epocaDelAno_id = diaHoy.epocaDelAno_id;
			if (epocaDelAno_id != 1) {
				const indice = rclvs.findIndex((n) => n.id == epocaDelAno_id && n.entidad == "epocasDelAno");
				rclvs[indice].fechaDelAno_id = diaHoy.id;
			}

			// Acciones si hay resultados
			if (rclvs.length) {
				// Ordena los registros
				rclvs
					.sort((a, b) => b.prioridad - a.prioridad) // Prioridad descendente
					.sort((a, b) => a.fechaDelAno_id - b.fechaDelAno_id); // Día ascendente

				// Mueve los pasados al futuro
				const indice = rclvs.findIndex((n) => n.fechaDelAno_id > diaHoy.id);
				if (indice > 0) {
					const pasados = rclvs.slice(0, indice - 1);
					rclvs.splice(0, indice - 1);
					rclvs.push(...pasados);
				}
			}

			// Fin
			return rclvs;
		},
		prefs: {
			prods: (configCons) => {
				// Variables
				const camposConsultas = variables.camposConsultas;
				const {idioma} = camposConsultas;
				let prefs = {};

				// Transfiere las preferencias simples a las condiciones
				for (let campo in configCons)
					if (camposConsultas[campo] && camposConsultas[campo].campoFiltro)
						prefs[camposConsultas[campo].campoFiltro] = configCons[campo];

				// Conversión de 'idioma'
				if (configCons.idioma) {
					const tipoLink = configCons.tipoLink == "conLinksHD" ? "conLinksHD" : "conLinks";
					const aux = idioma.opciones.find((n) => n.id == configCons.idioma).condic[tipoLink];
					prefs = {...prefs, ...aux};
				}

				// Conversión de campos similares
				for (let campo of ["tipoLink", "publicos"])
					if (configCons[campo]) {
						const aux = camposConsultas[campo].opciones.find((n) => n.id == configCons[campo]).condic;
						prefs = {...prefs, ...aux};
					}

				// Fin
				return prefs;
			},
			otrosFiltros: ({resultados, configCons, campo_id}) => {
				// Variables
				const {apMar, rolesIgl, canons, entidad} = configCons;

				// Filtra por apMar
				if (apMar)
					resultados =
						apMar == "SI"
							? resultados.filter(
									(n) =>
										(n.personaje_id > 10 && n.personaje.apMar_id != 10) ||
										(n.hecho_id > 10 && n.hecho.ama == 1)
							  )
							: resultados.filter(
									(n) =>
										(n.personaje_id > 10 && n.personaje.apMar_id == 10) ||
										(n.hecho_id > 10 && n.hecho.ama == 0)
							  );

				// Filtra por rolesIgl
				if (rolesIgl)
					resultados =
						rolesIgl == "RS"
							? resultados.filter(
									(n) =>
										n.personaje_id > 10 &&
										(n.personaje.rolIglesia_id.startsWith("RE") || n.personaje.rolIglesia_id.startsWith("SC"))
							  )
							: resultados.filter((n) => n.personaje_id > 10 && n.personaje.rolIglesia_id.startsWith(rolesIgl));

				// Filtra por canons

				if (canons)
					resultados =
						canons == "SB"
							? resultados.filter(
									(n) =>
										n.personaje_id > 10 &&
										(n.personaje.canon_id.startsWith("ST") || n.personaje.canon_id.startsWith("BT"))
							  ) // Santos y Beatos
							: canons == "VS"
							? resultados.filter(
									(n) =>
										n.personaje_id > 10 &&
										(n.personaje.canon_id.startsWith("VN") || n.personaje.canon_id.startsWith("SD"))
							  ) // Venerables y Siervos de Dios
							: canons == "TD"
							? resultados.filter((n) => n.personaje_id > 10 && !n.personaje.canon_id.startsWith("NN")) // Todos (Santos a Siervos)
							: resultados.filter((n) => n.personaje_id > 10 && n.personaje.canon_id.startsWith("NN")); // Sin proceso de canonización

				// Filtra por entidad
				if (campo_id) resultados = resultados.filter((n) => n.entidad == entidad);

				// Fin
				return resultados;
			},
			rclvs: (configCons) => {
				// Variables
				const {entidad, opcion} = configCons;
				const {apMar, rolesIgl, canons} = variables.camposConsultas;
				let prefs = {};

				// Si la opción es 'Por fecha en que se lo recuerda'
				if (opcion.codigo.startsWith("fechaDelAno")) prefs.fechaDelAno_id = {[Op.lt]: 400};

				// Época de ocurrencia
				if (configCons.epocasOcurrencia) prefs.epocaOcurrencia_id = configCons.epocasOcurrencia;

				// Relación con la Iglesia Católica
				if (configCons.cfc)
					entidad == "personajes"
						? (prefs.rolIglesia_id = configCons.cfc == 1 ? {[Op.notLike]: "NN%"} : {[Op.like]: "NN%"})
						: (prefs.soloCfc = configCons.cfc);

				// Aparición mariana
				if (configCons.apMar) {
					const condicion = apMar.opciones.find((n) => n.id == configCons.apMar).condic;
					entidad == "personajes" ? (prefs.apMar_id = condicion.pers) : (prefs.ama = condicion.hec);
				}

				// Roles en la Iglesia
				if (entidad == "personajes" && configCons.rolesIgl)
					prefs.rolIglesia_id = rolesIgl.opciones.find((n) => n.id == configCons.rolesIgl).condic;

				// Canonización
				if (entidad == "personajes" && configCons.canons)
					prefs.canon_id = canons.opciones.find((n) => n.id == configCons.canons).condic;

				// Fin
				return prefs;
			},
		},
		cruce: {
			// Productos
			prodsConPPP: ({prods, pppRegistros, configCons, usuario_id, opcion}) => {
				if (!prods.length) return [];
				if (!usuario_id) return opcion.codigo != "misPrefs" ? prods : [];

				// Si se cumple un conjunto de condiciones, se borran todos los productos y termina la función
				if (
					configCons.pppOpciones && // se eligieron 'pppOpciones'
					!configCons.pppOpciones.includes(String(sinPref.id)) && // la opción elegida no incluye a 'sinPref'
					!pppRegistros.length // no hay registros 'ppp'
				)
					return [];

				// Rutina por producto
				for (let i = prods.length - 1; i >= 0; i--) {
					// Averigua si el producto tiene un registro de preferencia del usuario
					const pppRegistro = pppRegistros.find((n) => n.entidad == prods[i].entidad && n.entidad_id == prods[i].id);

					// Acciones si se eligió un tipo de preferencia
					if (configCons.pppOpciones) {
						// Elimina los registros que correspondan
						if (
							(pppRegistro && !configCons.pppOpciones.includes(String(pppRegistro.opcion_id))) || // tiene alguna preferencia que no es la que se había elegido
							(!pppRegistro && !configCons.pppOpciones.includes(String(sinPref.id))) // no tiene una preferencia y no se eligió 'sinPref'
						)
							prods.splice(i, 1);
						// Si no se eliminó, le agrega a los productos la 'ppp' del usuario
						else {
							// Variable
							const pppOpcionElegida =
								configCons.pppOpciones == sinPref.id || !pppRegistro
									? sinPref
									: pppOpciones.find((n) => n.id == pppRegistro.opcion_id);

							// Le agrega a los productos la 'ppp' del usuario
							prods[i].pppIcono = pppOpcionElegida.icono;
							prods[i].pppNombre = pppOpcionElegida.nombre;

							// Le agrega datos adicionales si se eligió la opción 'misPrefs'
							if (opcion.codigo == "misPrefs") {
								prods[i].ppp_id = pppOpcionElegida.id;
								prods[i].misPrefs = pppRegistro.creadoEn;
								prods[i].yaLaVi = pppOpcionElegida.codigo == "yaLaVi";
								prods[i].laQuieroVer = pppOpcionElegida.codigo == "laQuieroVer";
							}
						}
					}
					// Si no se eligió un tipo de preferencia, le agrega a los productos la ppp del usuario
					else {
						prods[i].pppIcono = pppRegistro ? pppRegistro.detalle.icono : sinPref.icono;
						prods[i].pppNombre = pppRegistro ? pppRegistro.detalle.nombre : sinPref.nombre;
					}
				}

				// Fin
				return prods;
			},
			prodsConPalsClave: ({entidad, prods, palabrasClave}) => {
				if (!prods.length) return [];
				if (!palabrasClave) return prods;

				// Variables
				let campos = ["nombreOriginal", "nombreCastellano", "sinopsis"];
				campos.push("direccion", "guion", "musica", "actores", "produccion");
				const camposInclude = variables.asocs.rclvs;
				palabrasClave = palabrasClave.toLowerCase();

				// Rutina por producto
				for (let i = prods.length - 1; i >= 0; i--) {
					// Variables
					const prod = prods[i];

					// Rutina por campo: si encuentra las palsClave => le agrega al producto el campo palsClave = true
					for (let campo of campos)
						if (prod[campo] && prod[campo].toLowerCase().includes(palabrasClave)) prods[i].palsClave = true;

					if (!prods[i].palsClave)
						for (let campo of camposInclude)
							if (prod[campo].nombre && prod[campo].nombre.toLowerCase().includes(palabrasClave))
								prods[i].palsClave = true;

					// Si la entidad es 'productos' y el producto no tiene las palsClave, lo elimina
					if (entidad == "productos" && !prods[i].palsClave) prods.splice(i, 1);
				}

				// Fin
				return prods;
			},
			prodsConRCLVs: ({prods, rclvs}) => {
				// Si no se pidió cruzar contra RCLVs, devuelve la variable intacta
				if (!rclvs) return prods;

				// Si no hay RCLVs, reduce a cero los productos
				if (!prods.length || !rclvs.length) return [];

				// Crea la variable consolidadora
				let prodsCruzadosConRCLVs = [];

				// Para cada RCLV, busca los productos
				for (let rclv of rclvs) {
					// Variables
					const campo_id = comp.obtieneDesdeEntidad.campo_id(rclv.entidad);
					const asociacion = comp.obtieneDesdeEntidad.asociacion(rclv.entidad);

					// Detecta los hallazgos
					const hallazgos = prods
						.filter((n) => n[campo_id] == rclv.id)
						.map((n) => ({...n, [asociacion]: {...n[asociacion], fechaDelAno: rclv.fechaDelAno.nombre}}));

					// Acciones si hay hallazgos
					if (hallazgos.length) {
						// Los agrega al consolidador
						prodsCruzadosConRCLVs.push(...hallazgos);

						// Los elimina de prods
						prods = prods.filter((n) => n[campo_id] != rclv.id);
					}
				}

				// Fin
				return prodsCruzadosConRCLVs;
			},
			prodsConMisCalifs: async ({prods, usuario_id, opcion}) => {
				// Interrupciones de la función
				if (opcion.codigo != "misCalificadas") return prods;
				if (!prods.length || !usuario_id) return [];

				// Obtiene los registros del usuario
				const misCalificadas = await BD_genericas.obtieneTodosPorCondicion("calRegistros", {usuario_id});
				if (!misCalificadas.length) return [];

				// Elimina los productos no calificados
				for (let i = prods.length - 1; i >= 0; i--) {
					const calificacion = misCalificadas.find((n) => n.entidad == prods[i].entidad && n.entidad_id == prods[i].id);
					if (!calificacion) prods.splice(i, 1);
					else prods[i].calificacion = calificacion.resultado;
				}

				// Fin
				return prods;
			},
			prodsConMisConsultas: async ({prods, usuario_id, opcion}) => {
				// Interrupciones de la función
				if (opcion.codigo != "misConsultas") return prods;
				if (!prods.length || !usuario_id) return [];

				// Obtiene los registros del usuario
				let misConsultas = await BD_genericas.obtieneTodosPorCondicion("misConsultas", {usuario_id});
				if (!misConsultas.length) return [];
				misConsultas.reverse();

				// Elimina los productos no consultados
				for (let i = prods.length - 1; i >= 0; i--) {
					const consulta = misConsultas.find((n) => n.entidad == prods[i].entidad && n.entidad_id == prods[i].id);
					if (!consulta) prods.splice(i, 1);
					else prods[i].fechaConsulta = consulta.visitadaEn;
				}

				// Fin
				return prods;
			},
			// RCLVs
			rclvsConPalsClave: ({rclvs, palabrasClave}) => {
				if (!rclvs.length) return [];
				if (!palabrasClave) return rclvs;

				// Variables
				let campos = ["nombre", "apodo"];
				palabrasClave = palabrasClave.toLowerCase();

				// Rutina por rclv
				for (let i = rclvs.length - 1; i >= 0; i--) {
					// Variables
					const rclv = rclvs[i];

					// Rutina por campo: si encuentra las palsClave => le agrega al rclv el campo palsClave = true
					for (let campo of campos)
						if (rclv[campo] && rclv[campo].toLowerCase().includes(palabrasClave)) rclvs[i].palsClave = true;
				}

				// Fin
				return rclvs;
			},
			rclvsConProds: ({rclvs, prods, palabrasClave, cantResults}) => {
				// Cruza 'rclvs' con 'prods'
				if (!prods.length || !rclvs.length) return [];

				// Tareas por RCLV
				let i = 0;
				while (i < rclvs.length && (cantResults ? i < cantResults : true)) {
					// Variables
					let rclv = rclvs[i];

					// Agrupa los productos en el método 'productos'
					const campo_id = comp.obtieneDesdeEntidad.campo_id(rclv.entidad);
					rclvs[i].productos = prods.filter((n) => n[campo_id] == rclv.id);

					// Si el usuario busca por 'palabrasClave' y ni el rclv ni sus productos las tienen, elimina el rclv
					if (palabrasClave && !rclv.palsClave && !rclv.productos.find((n) => n.palsClave)) rclvs.splice(i, 1);
					// Acciones en caso contrario
					else {
						// Si el usuario busca por 'palabrasClave' y el rclv no las tiene, deja solamente los productos que las tienen
						if (palabrasClave && !rclv.palsClave) rclvs[i].productos = rclv.productos.filter((n) => n.palsClave);

						// Ordena los productos por su año de estreno
						rclvs[i].productos.sort((a, b) => (a.anoEstreno > b.anoEstreno ? -1 : 1));

						// Deja solamente los campos necesarios
						rclvs[i].productos = rclvs[i].productos.map((n) => {
							// Obtiene campos simples
							let {entidad, id, nombreCastellano, pppIcono, pppNombre, direccion, anoEstreno} = n;
							let datosProd = {entidad, id, nombreCastellano, pppIcono, pppNombre, direccion, anoEstreno};

							// Achica el campo dirección
							if (direccion && direccion.indexOf(",") > 0)
								datosProd.direccion = direccion.slice(0, direccion.indexOf(","));

							// Obtiene el nombre de la entidad
							datosProd.entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

							// Si es una colección, agrega el campo 'anoFin'
							if (n.entidad == "colecciones") datosProd.anoFin = n.anoFin;

							// Fin
							return datosProd;
						});

						// Aumenta el índice para analizar el siguiente registro
						i++;
					}
				}

				// Fin
				return rclvs;
			},
		},
		orden: {
			prods: ({prods, opcion}) => {
				// Ordena por el azar decreciente
				prods.sort((a, b) => b.azar - a.azar);

				// Si corresponde, interrumpe la función
				if (opcion.codigo == "azar") return prods;

				// Variables
				const campo = false
					? false
					: opcion.codigo == "nombre"
					? "nombreCastellano"
					: opcion.codigo == "misCalificadas"
					? "calificacion"
					: opcion.codigo == "misConsultas"
					? "fechaConsulta"
					: opcion.codigo.startsWith("fechaDelAno")
					? "fechaDelAno_id"
					: opcion.codigo;

				// Ordena
				prods.sort((a, b) =>
					false
						? false
						: typeof a[campo] == "string" && b[campo] == "string"
						? opcion.ascDes == "ASC" // acciones para strings
							? a[campo].toLowerCase() < b[campo].toLowerCase()
								? -1
								: 1
							: a[campo].toLowerCase() > b[campo].toLowerCase()
							? -1
							: 1
						: opcion.ascDes == "ASC" // acciones para 'no strings'
						? a[campo] < b[campo]
							? -1
							: 1
						: a[campo] > b[campo]
						? -1
						: 1
				);

				// Orden adicional para "misPrefs"
				if (opcion.codigo == "misPrefs") {
					prods.sort((a, b) => (a.yaLaVi && !b.yaLaVi ? -1 : 0));
					prods.sort((a, b) => (a.laQuieroVer && !b.laQuieroVer ? -1 : 0));
				}

				// Fin
				return prods;
			},
			rclvs: ({rclvs, opcion, entidad}) => {
				// Si no corresponde ordenar, interrumpe la función
				if (rclvs.length <= 1 || opcion.codigo.startsWith("fechaDelAno")) return rclvs;

				// Si la opción es por año, los ordena adicionalmente por su época, porque algunos registros tienen su año en 'null'
				if (opcion.codigo == "anoHistorico") {
					const campo = entidad == "personajes" ? "anoNacim" : entidad == "hechos" ? "anoComienzo" : "";

					opcion.ascDes == "ASC"
						? rclvs.sort((a, b) => (a[campo] < b[campo] ? -1 : 1))
						: rclvs.sort((a, b) => (a[campo] > b[campo] ? -1 : 1));

					opcion.ascDes == "ASC"
						? rclvs.sort((a, b) => (a.epocaOcurrencia.orden < b.epocaOcurrencia.orden ? -1 : 1))
						: rclvs.sort((a, b) => (a.epocaOcurrencia.orden > b.epocaOcurrencia.orden ? -1 : 1));
				}
				// En los demás casos, ordena por su campo
				else
					rclvs.sort((a, b) =>
						typeof a[opcion.codigo] == "string" && b[opcion.codigo] == "string"
							? opcion.ascDes == "ASC"
								? a[opcion.codigo].toLowerCase() < b[opcion.codigo].toLowerCase()
									? -1
									: 1
								: a[opcion.codigo].toLowerCase() > b[opcion.codigo].toLowerCase()
								? -1
								: 1
							: opcion.ascDes == "ASC"
							? a[opcion.codigo] < b[opcion.codigo]
								? -1
								: 1
							: a[opcion.codigo] > b[opcion.codigo]
							? -1
							: 1
					);

				// Fin
				return rclvs;
			},
		},
		botonesListado: ({resultados, opcion, configCons}) => {
			// Variables
			const cantResults = opcion.cantidad;

			// Botones
			if (opcion.codigo == "azar") resultados = alAzar.consolidado({resultados, cantResults, opcion, configCons});
			else if (cantResults) resultados.splice(cantResults);

			// Fin
			return resultados;
		},
		camposNecesarios: {
			prods: ({prods, opcion}) => {
				// Si no hay registros a achicar, interrumpe la función
				if (!prods.length) return [];

				// Deja solamente los campos necesarios
				prods = prods.map((prod) => {
					// Obtiene campos simples
					const {entidad, id, nombreCastellano, pppIcono, pppNombre} = prod;
					const {direccion, anoEstreno, avatar, cfc} = prod;
					let datosProd = {entidad, id, nombreCastellano, pppIcono, pppNombre};
					datosProd = {...datosProd, direccion, anoEstreno, avatar, cfc};
					if (prod.calificacion) datosProd.calificacion = prod.calificacion;
					if (prod.epocaEstreno) datosProd.epocaEstreno = prod.epocaEstreno.nombre;

					// Achica el campo dirección
					if (direccion && direccion.indexOf(",") > 0) datosProd.direccion = direccion.slice(0, direccion.indexOf(","));

					// Obtiene el nombre de la entidad
					datosProd.entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

					// Obtiene los RCLV
					for (let entRclv of variables.entidades.rclvs) {
						// Variables
						const campo_id = comp.obtieneDesdeEntidad.campo_id(entRclv);
						const asociacion = comp.obtieneDesdeEntidad.asociacion(entRclv);
						const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entRclv);

						// RCLV nombre
						if (
							prod[campo_id] > 10 && // el id es de un registro válido
							(!opcion.codigo.includes("fechaDelAno_id") || prod[asociacion].fechaDelAno) // no se busca por fecha o el campo tiene fecha
						) {
							datosProd[entidadNombre] = prod[asociacion].nombre;
							if (opcion.codigo.startsWith("fechaDelAno") && entRclv != "epocasDelAno")
								datosProd.fechaDelAno = prod[asociacion].fechaDelAno;
							break;
						}
					}

					// Si es una colección, agrega el campo 'anoFin'
					if (prod.entidad == "colecciones") datosProd.anoFin = prod.anoFin;

					// Fin
					return datosProd;
				});

				// Fin
				return prods;
			},
			rclvs: ({rclvs, opcion}) => {
				// Si no hay registros, interrumpe la función
				if (!rclvs.length) return [];

				// Deja solamente los campos necesarios
				rclvs = rclvs.map((n) => {
					// Arma el resultado
					const {entidad, id, nombre, productos, avatar, fechaDelAno_id, fechaDelAno} = n;
					let datosRclv = {entidad, id, nombre, productos, avatar};
					if (opcion.codigo.startsWith("fechaDelAno"))
						datosRclv = {...datosRclv, fechaDelAno_id, fechaDelAno}; // hace falta la 'fechaDelAno_id' en el Front-End
					else if (n.apodo) datosRclv.apodo = n.apodo;

					// Obtiene campos en función de la entidad
					if (entidad == "personajes") {
						datosRclv.epocaOcurrenciaNombre = n.epocaOcurrencia.consulta;
						datosRclv.epocaOcurrencia_id = n.epocaOcurrencia_id;
						datosRclv.anoNacim = n.anoNacim;
						if (!n.rolIglesia_id.startsWith("NN")) {
							datosRclv.rolIglesiaNombre = n.rolIglesia.nombre;
							if (!n.canon_id.startsWith("NN")) datosRclv.canonNombre = n.canon.nombre;
						}
					}
					if (entidad == "hechos") {
						datosRclv.epocaOcurrenciaNombre = n.epocaOcurrencia.consulta;
						datosRclv.epocaOcurrencia_id = n.epocaOcurrencia_id;
						datosRclv.anoComienzo = n.anoComienzo;
					}

					// Fin
					return datosRclv;
				});

				// Fin
				return rclvs;
			},
		},
	},
};

// Funciones
let alAzar = {
	consolidado: function ({resultados, cantResults, opcion, configCons}) {
		// Variables
		let v = {
			resultados,
			cantResults,
			ahora: new Date(),
			cfc: 0,
			vpc: 0,
			contador: 0,
			productos: [],
		};

		// Averigua si se debe equilibrar entre 'cfc' y 'vpc'
		v.seDebeEquilibrar =
			opcion.codigo == "azar" &&
			!configCons.cfc && // 'cfc' no está contestado
			!configCons.apMar && // 'apMar' no está contestado
			(!configCons.canons || configCons.canons == "NN") && // 'canons' no está contestado
			!configCons.rolesIgl; // 'rolesIgl' no está contestado

		// Elije los productos
		if (opcion.codigo == "azar") {
			this.porAltaUltimosDias(v);
			for (let epocaEstreno of epocasEstreno) this.porEpocaDeEstreno({epocaEstreno, v});
		}

		// Agrega registros hasta llegar a cuatro
		let indice = 0;
		while (v.contador < 4 && v.resultados.length && indice < v.resultados.length) {
			v.resultado = v.resultados[indice];
			if (!v.seDebeEquilibrar || (v.resultado.cfc && v.cfc < 2) || (!v.resultado.cfc && v.vpc < 2)) this.agregaUnBoton(v);
			else indice++;
		}
		while (v.contador < 4 && v.resultados.length) {
			v.resultado = v.resultados[0];
			this.agregaUnBoton(v);
		}

		// Si corresponde, ordena los resultados
		if (opcion.codigo == "azar") v.productos.sort((a, b) => b.anoEstreno - a.anoEstreno);

		// Fin
		return v.productos;
	},
	porAltaUltimosDias: function (v) {
		// Outputs - Último día
		v.resultado = v.resultados.find((n) => new Date(n.altaRevisadaEn).getTime() > v.ahora.getTime() - unDia);
		this.agregaUnBoton(v);

		// Outputs - Últimos días
		if (!v.productos.length) {
			v.resultado = v.resultados.find((n) => new Date(n.altaRevisadaEn).getTime() > v.ahora.getTime() - unDia * 2);
			this.agregaUnBoton(v);
		}

		// Fin
		return;
	},
	porEpocaDeEstreno: function ({epocaEstreno, v}) {
		// Variables
		const epocaID = epocaEstreno.id;
		const suma = [1, 2].includes(epocaID) ? 3 : 7; // la suma de los IDs posibles

		// Si ya existe un producto para esa epoca de estreno, termina la función
		if (v.productos.find((n) => n.epocaEstreno_id == epocaID)) return;

		// Obtiene cfc/vpc
		const contraparte = v.productos.find((n) => n.epocaEstreno_id == suma - epocaID);
		const cfc = v.seDebeEquilibrar && contraparte ? (contraparte.cfc ? false : true) : null;

		// Obtiene los productos de esa época de estreno
		v.resultado = v.resultados.filter((n) => n.epocaEstreno_id == epocaID);
		if (v.resultado.length && cfc !== null) v.resultado = v.resultado.filter((n) => n.cfc === cfc);

		// Agrega un botón
		if (v.resultado.length) {
			v.resultado = v.resultado[0];
			this.agregaUnBoton(v);
		}

		// Fin
		return;
	},
	agregaUnBoton: (v) => {
		// Si se llegó a los cuatro, aborta
		if (v.contador == v.cantResults || !v.resultado) return v;

		// Miscelaneas
		v.productos.push(v.resultado);
		v.contador++;
		v.resultado.cfc ? v.cfc++ : v.vpc++;

		// Quita el registro de los resultados
		const indice = v.resultados.findIndex((n) => n.id == v.resultado.id && n.entidad == v.resultado.entidad);
		v.resultados.splice(indice, 1);

		// Borra los últimos resultados
		delete v.resultado;

		// Fin
		return;
	},
};
