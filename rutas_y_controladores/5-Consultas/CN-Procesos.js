"use strict";
// Definir variables
const BD_genericas = require("../../funciones/1-BD/Genericas");
const comp = require("../../funciones/2-Procesos/Compartidas");
const variables = require("../../funciones/2-Procesos/Variables");

module.exports = {
	configs: {
		cabecera: async (userID) => {
			// Obtiene los filtros personalizados propios y de ELC
			const usuario_id = [1, userID];
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
		prods: async function ({configCons, entidad, orden}) {
			// Variables
			const campo_id = entidad != "productos" ? comp.obtieneDesdeEntidad.campo_id(entidad) : null;
			let include = [...variables.asocs.rclvs];
			let entsProd = ["peliculas", "colecciones"];
			let productos = [];
			let resultados = [];

			// Condiciones
			const prefs = this.prefs.prods(configCons);
			let condiciones = {statusRegistro_id: aprobado_id, ...prefs};
			if (orden.codigo == "fechaDelAno_id" || entidad != "productos") entsProd.push("capitulos"); // Para el orden 'fechaDelAno_id' o layout 'Listados por', agrega la entidad 'capitulos'
			// if (orden.codigo == "azar") condiciones = {...condiciones, calificacion: {[Op.gte]: 70}}; // Para el orden 'azar', agrega pautas en las condiciones
			if (orden.codigo == "calificacion") condiciones = {...condiciones, calificacion: {[Op.ne]: null}}; // Para el orden 'calificación', agrega pautas en las condiciones
			if (campo_id) condiciones = {...condiciones, [campo_id]: {[Op.ne]: 1}}; // Si son productos de RCLVs, el 'campo_id' debe ser distinto a 'uno'

			// Obtiene los productos
			for (let entProd of entsProd)
				productos.push(
					BD_genericas.obtieneTodosPorCondicionConInclude(entProd, condiciones, include).then((n) =>
						n.map((m) => ({...m, entidad: entProd}))
					)
				);
			await Promise.all(productos).then((n) => n.map((m) => resultados.push(...m)));
			resultados = this.prefs.prodsConInclude({resultados, configCons});

			// Fin
			return resultados;
		},
		rclvs: async function ({configCons, entidad, orden}) {
			// Obtiene los include
			let include = [...variables.entidades.prods, "fechaDelAno"];
			if (["personajes", "hechos"].includes(entidad)) include.push("epocaOcurrencia");
			if (entidad == "personajes") include.push("rolIglesia", "canon");

			// Obtiene las condiciones
			const prefs = ["personajes", "hechos"].includes(entidad) ? this.prefs.rclvs({configCons, entidad, orden}) : null;
			const condiciones = {statusRegistro_id: aprobado_id, id: {[Op.gt]: 10}, ...prefs}; // Status aprobado e ID mayor a 10

			// Obtiene los RCLVs
			const rclvs = await BD_genericas.obtieneTodosPorCondicionConInclude(entidad, condiciones, include).then((n) =>
				n.filter((m) => m.peliculas.length || m.colecciones.length || m.capitulos.length)
			);

			// Fin
			return rclvs;
		},
		prefs: {
			prods: (configCons) => {
				// Variables
				const vars = {...variables.camposConsultas};
				const {publicos, tiposLink, castellano} = vars;
				let prefs = {};

				// Transfiere las preferencias simples a las condiciones
				for (let campo in configCons)
					if (vars[campo] && vars[campo].campoFiltro) prefs[vars[campo].campoFiltro] = configCons[campo];

				// Conversión de 'publicos'
				if (configCons.publicos) {
					const aux = publicos.opciones.find((n) => n.id == configCons.publicos).condic;
					prefs = {...prefs, ...aux};
				}

				// Conversión de 'tiposLink'
				if (configCons.tiposLink) {
					const aux = tiposLink.opciones.find((n) => n.id == configCons.tiposLink).condic;
					prefs = {...prefs, ...aux};
				}

				// Conversión de 'castellano'
				if (configCons.castellano) {
					const aux = castellano.opciones.find((n) => n.id == configCons.castellano).condic;
					prefs = {...prefs, ...aux};
				}

				// Fin
				return prefs;
			},
			prodsConInclude: ({resultados, configCons}) => {
				// Variables
				const {apMar, rolesIgl, canons} = configCons;

				// Filtra por apMar
				if (apMar && resultados.length) {
					if (apMar == "SI")
						resultados = resultados.filter(
							(n) => (n.personaje_id > 10 && n.personaje.apMar_id != 10) || (n.hecho_id > 10 && n.hecho.ama == 1)
						);
					if (apMar == "NO")
						resultados = resultados.filter(
							(n) => (n.personaje_id > 10 && n.personaje.apMar_id == 10) || (n.hecho_id > 10 && n.hecho.ama == 0)
						);
				}

				// Filtra por rolesIgl
				if (rolesIgl && resultados.length) {
					if (rolesIgl == "RS")
						resultados = resultados.filter(
							(n) =>
								n.personaje_id > 10 &&
								(n.personaje.rolIglesia_id.startsWith("RE") || n.personaje.rolIglesia_id.startsWith("SC"))
						);
					else
						resultados = resultados.filter(
							(n) => n.personaje_id > 10 && n.personaje.rolIglesia_id.startsWith(rolesIgl)
						);
				}

				// Filtra por canons
				if (canons && resultados.length) {
					// Santos y Beatos
					if (canons == "SB")
						resultados = resultados.filter(
							(n) =>
								n.personaje_id > 10 &&
								(n.personaje.canon_id.startsWith("ST") || n.personaje.canon_id.startsWith("BT"))
						);
					// Venerables y Siervos de Dios
					else if (canons == "VS")
						resultados = resultados.filter(
							(n) =>
								n.personaje_id > 10 &&
								(n.personaje.canon_id.startsWith("VN") || n.personaje.canon_id.startsWith("SD"))
						);
					// Todos (Santos a Siervos)
					else if (canons == "TD")
						resultados = resultados.filter((n) => n.personaje_id > 10 && !n.personaje.canon_id.startsWith("NN"));
					// Sin proceso de canonización
					else resultados = resultados.filter((n) => n.personaje_id > 10 && n.personaje.canon_id.startsWith("NN"));
				}

				// Fin
				return resultados;
			},
			rclvs: ({configCons, entidad, orden}) => {
				// Variables
				const {apMar, rolesIgl, canons} = variables.camposConsultas;
				let prefs = {};

				// Si el orden es 'Por fecha en que se lo recuerda'
				if (orden.codigo == "fechaDelAno_id") prefs.fechaDelAno_id = {[Op.lt]: 400};

				// Época de ocurrencia
				if (configCons.epocasOcurrencia) prefs.epocaOcurrencia_id = configCons.epocasOcurrencia;

				// Relación con la Iglesia Católica
				if (configCons.cfc)
					entidad == "personajes"
						? (prefs.rolIglesia_id = configCons.cfc == 1 ? {[Op.notLike]: "NN%"} : {[Op.like]: "NN%"})
						: (prefs.soloCfc = configCons.cfc);

				// Aparición mariana
				if (configCons.apMar) {
					prefs.apMar_id = apMar.opciones.find((n) => n.id == configCons.apMar).condic;
					prefs.apMar_id = entidad == "personajes" ? prefs.apMar_id.pers : prefs.apMar_id.hec;
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
		pppRegistros: async ({usuario_id, configCons}) => {
			// Si el usuario no está logueado, interrumpe la función
			if (!usuario_id) return [];

			// Obtiene la condición
			let condicion = {usuario_id};
			if (configCons.pppOpciones && configCons.pppOpciones != sinPref.id) condicion.opcion_id = configCons.pppOpciones; // Si el usuario eligió una preferencia y es distinta a 'sinPref', restringe la búsqueda a los registros con esa 'opcion_id'

			// Obtiene los registros
			let pppRegistros = await BD_genericas.obtieneTodosPorCondicionConInclude("pppRegistros", condicion, "detalle");

			// Fin
			return pppRegistros;
		},
		prodsDiaDelAno_id: async ({dia, mes}) => {
			// Variables
			const entidadesRCLV = variables.entidades.rclvs.slice(0, -1); // Descarta la última entidad (epocaDelAno)
			const diaInicial_id = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes).id;
			let registros = [];
			let condicion;

			// Rutina para obtener los RCLVs de los días 0, +1, +2
			for (let dia = 0; dia < 366; dia++) {
				// Variables
				let fechaDelAno_id = diaInicial_id + dia;
				if (fechaDelAno_id > 366) fechaDelAno_id -= 366;

				// Obtiene los RCLV, a excepción de la familia 'epocaDelAno'
				for (let entidad of entidadesRCLV) {
					// Condicion estandar: RCLVs del dia y en status aprobado
					condicion = {id: {[Op.gt]: 10}, fechaDelAno_id, statusRegistro_id: aprobado_id};

					// Obtiene los registros
					registros.push(
						BD_genericas.obtieneTodosPorCondicionConInclude(entidad, condicion, "fechaDelAno")
							// Les agrega su entidad y el dia
							.then((n) => n.map((m) => ({...m, entidad, dia})))
					);
				}

				// Busca el registro de 'epocaDelAno'
				const epocaDelAno_id = fechasDelAno.find((n) => n.id == fechaDelAno_id).epocaDelAno_id;
				if (epocaDelAno_id != 1) {
					const condicion = {id: epocaDelAno_id, statusRegistro_id: aprobado_id};
					registros.push(
						BD_genericas.obtieneTodosPorCondicionConInclude("epocasDelAno", condicion, "fechaDelAno")
							// Les agrega su entidad y el dia
							.then((n) => n.map((m) => ({...m, entidad: "epocasDelAno", dia})))
					);
				}
			}

			// Espera y consolida la informacion
			let rclvs = [];
			await Promise.all(registros).then((n) => n.map((m) => rclvs.push(...m)));

			// Elimina los repetidos
			if (rclvs.length)
				for (let i = rclvs.length - 1; i >= 0; i--) {
					let rclv = rclvs[i];
					if (i != rclvs.findIndex((n) => n.id == rclv.id && n.entidad == rclv.entidad)) rclvs.splice(i, 1);
				}

			// Los ordena:
			if (rclvs.length) rclvs.sort((a, b) => b.prioridad - a.prioridad); // Prioridad descendente
			if (rclvs.length) rclvs.sort((a, b) => a.dia - b.dia); // Día ascendente

			// Fin
			return rclvs;
		},
		cruce: {
			// Productos
			prodsConPPP: ({prods, pppRegistros, configCons, usuario_id, orden}) => {
				if (!prods.length) return [];
				if (!usuario_id) return orden.codigo != "pppFecha" ? prods : [];

				// Si se cumple un conjunto de condiciones, se borran todos los productos y termina la función
				if (configCons.pppOpciones && configCons.pppOpciones != sinPref.id && !pppRegistros.length) return [];

				// Rutina por producto
				for (let i = prods.length - 1; i >= 0; i--) {
					// Averigua si el producto tiene un registro de preferencia del usuario
					const pppRegistro = pppRegistros.find((n) => n.entidad == prods[i].entidad && n.entidad_id == prods[i].id);

					// Acciones si se eligió un tipo de preferencia
					if (configCons.pppOpciones) {
						// Elimina los registros que correspondan
						if (
							(configCons.pppOpciones.includes(sinPref.id) && pppRegistro) || // Si tiene alguna preferencia y se había elegido "sin preferencia"
							(!configCons.pppOpciones.includes(sinPref.id) && !pppRegistro) // Si se había elegido alguna preferencia y no la tiene
						)
							prods.splice(i, 1);
						// Si no se eliminó, le agrega a los productos la ppp del usuario
						else {
							// Variable
							const pppOpcionElegida =
								configCons.pppOpciones == sinPref.id
									? sinPref
									: pppOpciones.find((n) => n.id == pppRegistro.opcion_id);

							prods[i] = {
								...prods[i],
								pppIcono: pppOpcionElegida.icono,
								pppNombre: pppOpcionElegida.nombre,
							};
							if (orden.codigo == "pppFecha") {
								prods[i].ppp_id = pppOpcionElegida.id;
								prods[i].pppFecha = pppRegistro.creadoEn;
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
			prodsConPalsClave: ({prods, palabrasClave, entidad}) => {
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
						for (let campo of camposInclude) {
							if (prod[campo].nombre && prod[campo].nombre.toLowerCase().includes(palabrasClave))
								prods[i].palsClave = true;
						}

					// Si la entidad es 'productos' y el producto no tiene las palsClave, lo elimina
					if (entidad == "productos" && !prods[i].palsClave) prods.splice(i, 1);
				}

				// Fin
				return prods;
			},
			prodsConRCLVs: ({prods, rclvs}) => {
				// Si no hay RCLVs porque no se pidió cruzar contra ellos, devuelve la variable intacta
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
			rclvsConProds: ({rclvs, prods, palabrasClave}) => {
				// Cruza 'rclvs' con 'prods'
				if (!prods.length || !rclvs.length) return [];

				// Rutina por RCLV
				for (let i = rclvs.length - 1; i >= 0; i--) {
					// Variables
					rclvs[i].productos = [];
					let rclv = rclvs[i];

					// Rutina por entProd de cada RCLV
					for (let entProd of variables.entidades.prods) {
						let prodsRCLV = rclv[entProd];

						// Rutina por productos de cada entProd
						for (let j = prodsRCLV.length - 1; j >= 0; j--) {
							// Rutina por producto
							const prodRCLV = prodsRCLV[j];

							// Averigua si existe la intersección
							const existe = prods.find((n) => n.entidad == entProd && n.id == prodRCLV.id);
							if (!existe) rclvs[i][entProd].splice(j, 1); // Si no existe, lo elimina
							else rclvs[i][entProd][j] = existe; // Reemplaza la información del producto por otra más completa
						}

						// Acciones finales
						rclvs[i].productos.push(...rclvs[i][entProd]); // Agrupa los productos en el array 'productos'
						delete rclvs[i][entProd]; // Elimina la familia
					}

					// Si el rclv no tiene productos, lo elimina
					if (!rclvs[i].productos.length) rclvs.splice(i, 1);
					// Si el usuario busca por 'palabrasClave' y ni el rclv ni sus productos las tienen, elimina el rclv
					else if (palabrasClave && !rclv.palsClave && !rclvs[i].productos.find((n) => n.palsClave)) rclvs.splice(i, 1);
					// Acciones en caso contrario
					else {
						// Si el usuario busca por 'palabrasClave' y el rclv no las tiene, deja solamente los productos que las tienen
						if (palabrasClave && !rclv.palsClave) rclvs[i].productos = rclvs[i].productos.filter((n) => n.palsClave);

						// Ordena los productos por su año de estreno
						rclvs[i].productos.sort((a, b) => (a.anoEstreno > b.anoEstreno ? -1 : 1));

						// Deja solamente los campos necesarios
						rclvs[i].productos = rclvs[i].productos.map((n) => {
							// Obtiene campos simples
							let {entidad, id, nombreCastellano, pppIcono, pppNombre, direccion, anoEstreno} = n;
							let datos = {entidad, id, nombreCastellano, pppIcono, pppNombre, direccion, anoEstreno};

							// Achica el campo dirección
							if (direccion && direccion.indexOf(",") > 0)
								datos.direccion = direccion.slice(0, direccion.indexOf(","));

							// Obtiene el nombre de la entidad
							datos.entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

							// Si es una colección, agrega el campo 'anoFin'
							if (n.entidad == "colecciones") datos.anoFin = n.anoFin;

							// Fin
							return datos;
						});
					}
				}

				// Fin
				return rclvs;
			},
		},
		orden: {
			prods: ({prods, orden, configCons}) => {
				// Si no corresponde ordenar, interrumpe la función
				if (prods.length <= 1 || orden.codigo == "fechaDelAno_id") return prods;

				// Variables
				const campo = orden.codigo == "nombre" ? "nombreCastellano" : orden.codigo;

				// Ordena
				prods.sort((a, b) =>
					typeof a[campo] == "string" && b[campo] == "string"
						? orden.ascDes == "ASC"
							? a[campo].toLowerCase() < b[campo].toLowerCase()
								? -1
								: 1
							: a[campo].toLowerCase() > b[campo].toLowerCase()
							? -1
							: 1
						: orden.ascDes == "ASC"
						? a[campo] < b[campo]
							? -1
							: 1
						: a[campo] > b[campo]
						? -1
						: 1
				);

				if (orden.codigo == "pppFecha") {
					prods.sort((a, b) => (a.yaLaVi && !b.yaLaVi ? -1 : 0));
					prods.sort((a, b) => (a.laQuieroVer && !b.laQuieroVer ? -1 : 0));
				}

				// Fin
				return prods;
			},
			rclvs: ({rclvs, orden, configCons, entidad}) => {
				// Si no hay nada que ordenar, interrumpe la función
				if (rclvs.length < 2) return rclvs;

				// Si el orden es por año, los ordena adicionalmente por su época, porque algunos registros tienen su año en 'null'
				if (orden.codigo == "anoHistorico") {
					const campo = entidad == "personajes" ? "anoNacim" : entidad == "hechos" ? "anoComienzo" : "";

					orden.ascDes == "ASC"
						? rclvs.sort((a, b) => (a[campo] < b[campo] ? -1 : 1))
						: rclvs.sort((a, b) => (a[campo] > b[campo] ? -1 : 1));

					orden.ascDes == "ASC"
						? rclvs.sort((a, b) => (a.epocaOcurrencia.orden < b.epocaOcurrencia.orden ? -1 : 1))
						: rclvs.sort((a, b) => (a.epocaOcurrencia.orden > b.epocaOcurrencia.orden ? -1 : 1));
				}
				// En los demás casos, ordena por su campo
				else
					rclvs.sort((a, b) =>
						typeof a[orden.codigo] == "string" && b[orden.codigo] == "string"
							? orden.ascDes == "ASC"
								? a[orden.codigo].toLowerCase() < b[orden.codigo].toLowerCase()
									? -1
									: 1
								: a[orden.codigo].toLowerCase() > b[orden.codigo].toLowerCase()
								? -1
								: 1
							: orden.ascDes == "ASC"
							? a[orden.codigo] < b[orden.codigo]
								? -1
								: 1
							: a[orden.codigo] > b[orden.codigo]
							? -1
							: 1
					);

				// Fin
				return rclvs;
			},
		},
		camposNecesarios: {
			prods: (prods, orden) => {
				// Si no hay registros a achicar, interrumpe la función
				if (!prods.length) return [];

				// Deja solamente los campos necesarios
				prods = prods.map((prod) => {
					// Obtiene campos simples
					const {entidad, id, nombreCastellano, pppIcono, pppNombre, direccion, anoEstreno, avatar, cfc} = prod;
					let datos = {entidad, id, nombreCastellano, pppIcono, pppNombre, direccion, anoEstreno, avatar, cfc};

					// Achica el campo dirección
					if (direccion && direccion.indexOf(",") > 0) datos.direccion = direccion.slice(0, direccion.indexOf(","));

					// Obtiene el nombre de la entidad
					datos.entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

					// Obtiene los RCLV
					for (let rclv of variables.entidades.rclvs) {
						// Variables
						const campo_id = comp.obtieneDesdeEntidad.campo_id(rclv);
						const asociacion = comp.obtieneDesdeEntidad.asociacion(rclv);
						const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(rclv);

						// RCLV nombre
						if (prod[campo_id] > 10) {
							datos[entidadNombre] = prod[asociacion].nombre;
							if (orden.codigo == "fechaDelAno_id") datos.fechaDelAno = prod[asociacion].fechaDelAno;
							break;
						}
					}

					// Obtiene la época del año
					datos.epocaEstrenoNombre = prod.epocaEstreno ? prod.epocaEstreno.nombre : "";

					// Si es una colección, agrega el campo 'anoFin'
					if (prod.entidad == "colecciones") datos.anoFin = prod.anoFin;

					// Fin
					return datos;
				});

				// Fin
				return prods;
			},
			rclvs: ({rclvs, orden, entidad}) => {
				// Si no hay registros a achicar, interrumpe la función
				if (!rclvs.length) return [];

				// Deja solamente los campos necesarios
				rclvs = rclvs.map((n) => {
					// Arma el resultado
					const {id, nombre, productos, fechaDelAno_id, fechaDelAno} = n;
					let datos = {id, nombre, productos};
					if (orden.codigo == "fechaDelAno_id")
						datos = {...datos, fechaDelAno_id, fechaDelAno}; // hace falta la 'fechaDelAno_id' en el Front-End
					else if (n.apodo) datos.apodo = n.apodo;

					// Obtiene campos en función de la entidad
					if (entidad == "personajes") {
						datos.epocaOcurrenciaNombre = n.epocaOcurrencia.consulta;
						datos.epocaOcurrencia_id = n.epocaOcurrencia_id;
						datos.anoNacim = n.anoNacim;
						if (!n.rolIglesia_id.startsWith("NN")) {
							datos.rolIglesiaNombre = n.rolIglesia.nombre;
							// datos.rolIglesiaGrupo = n.rolIglesia.plural;
							if (!n.canon_id.startsWith("NN")) datos.canonNombre = n.canon.nombre;
						}
					}
					if (entidad == "hechos") {
						datos.epocaOcurrenciaNombre = n.epocaOcurrencia.consulta;
						datos.epocaOcurrencia_id = n.epocaOcurrencia_id;
						datos.anoComienzo = n.anoComienzo;
					}

					// Fin
					return datos;
				});

				// Fin
				return rclvs;
			},
		},
	},
};
