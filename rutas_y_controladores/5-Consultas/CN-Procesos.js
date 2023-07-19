"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");

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
					if (campo == "epocasOcurrencia")
						campos.epocasOcurrencia.opciones = epocasOcurrencia
							.filter((n) => !n.varias)
							.map((n) => ({id: n.id, nombre: n.consulta}));
					else campos[campo].opciones = global[campo];
				}
			}

			// Fin
			return campos;
		},
	},
	resultados: {
		prods: async function ({configCons, entidad}) {
			// Variables
			const {orden_id, apMar, rolesIgl, canons} = configCons;
			const campo_id = entidad ? comp.obtieneDesdeEntidad.campo_id(entidad) : null;
			let entidades = ["peliculas", "colecciones"];
			let condiciones = {statusRegistro_id: aprobado_id};
			let productos = [];
			let resultados = [];

			// Particularidades
			if (orden_id == 1 || entidad) entidades.push("capitulos"); // Para el orden 'Momento del año' o layout 'Películas por', agrega la entidad 'capitulos'
			if (orden_id == 2) condiciones = {...condiciones, calificacion: {[Op.gte]: 70}}; // Para el orden 'Sorprendeme', agrega pautas en las condiciones
			if (orden_id == 5) condiciones = {...condiciones, calificacion: {[Op.ne]: null}}; // Para el orden 'Por calificación', agrega pautas en las condiciones
			if (campo_id) condiciones = {...condiciones, [campo_id]: {[Op.ne]: 1}}; // Si son productos de RCLVs, el 'campo_id' debe ser distinto a 'uno'

			// Agrega las preferencias
			const prefs = this.prefs.prods(configCons);
			condiciones = {...condiciones, ...prefs};

			// Obtiene el include (sólo el layout 'Todas las Películas' lo puede generar)
			let include;
			apMar ? (include = ["personaje", "hecho"]) : rolesIgl || canons ? (include = "personaje") : null;

			// Obtiene los productos
			for (let entidad of entidades)
				productos.push(
					(include
						? BD_genericas.obtieneTodosPorCondicionConInclude(entidad, condiciones, include)
						: BD_genericas.obtieneTodosPorCondicion(entidad, condiciones)
					).then((n) => n.map((m) => ({...m, entidad})))
				);
			await Promise.all(productos).then((n) => n.map((m) => resultados.push(...m)));

			// Filtra por apMar, rolesIgl, canons (sólo el layout 'Todas las Películas' lo puede generar)
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
			if (rolesIgl && resultados.length) {
				if (rolesIgl == "RS")
					resultados = resultados.filter(
						(n) =>
							n.personaje_id > 10 &&
							(n.personaje.rolIglesia_id.startsWith("RE") || n.personaje.rolIglesia_id.startsWith("SC"))
					);
				else resultados = resultados.filter((n) => n.personaje_id > 10 && n.personaje.rolIglesia_id.startsWith(rolesIgl));
			}
			if (canons && resultados.length) {
				if (canons == "SB")
					resultados = resultados.filter(
						(n) =>
							n.personaje_id > 10 &&
							(n.personaje.canon_id.startsWith("ST") || n.personaje.canon_id.startsWith("BT"))
					);
				else if (canons == "VS")
					resultados = resultados.filter(
						(n) =>
							n.personaje_id > 10 &&
							(n.personaje.canon_id.startsWith("VN") || n.personaje.canon_id.startsWith("SD"))
					);
				else resultados = resultados.filter((n) => n.personaje_id > 10 && n.personaje.canon_id.startsWith(canons));
			}

			// Fin
			return resultados;
		},
		rclvs: async function ({configCons, entidad, orden}) {
			// Obtiene los include
			let include = [...variables.entidades.prods];
			if (["personajes", "hechos"].includes(entidad)) include.push("epocaOcurrencia");
			if (entidad == "personajes") include.push("rolIglesia", "canon");

			// Obtiene las condiciones básicas
			let condiciones = {statusRegistro_id: aprobado_id, id: {[Op.gt]: 10}}; // Status aprobado e ID mayor a 10

			// Agrega condiciones particuylares de 'personajes' y 'hechos'
			if (["personajes", "hechos"].includes(entidad)) {
				const prefs = this.prefs.rclvs({configCons, entidad, orden});
				condiciones = {...condiciones, ...prefs};
			}

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
				const vars = variables.camposConsultas;
				const {tiposLink, castellano} = vars;
				let prefs = {};

				// Transfiere las preferencias simples a las condiciones
				for (let campo in configCons) if (vars[campo] && vars[campo].campo) prefs[vars[campo].campo] = configCons[campo];

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
			rclvs: ({configCons, entidad, orden}) => {
				// Variables
				const {apMar, rolesIgl, canons} = variables.camposConsultas;
				let prefs = {};

				// Si el orden es 'Por fecha en que se lo recuerda'
				if (orden.valor == "diaDelAno_id") prefs.diaDelAno_id = {[Op.lt]: 400};

				// Época de ocurrencia
				if (configCons.epocasOcurrencia) prefs.epocaOcurrencia_id = configCons.epocasOcurrencia;

				// Relación con la Iglesia Católica
				if (configCons.cfc)
					entidad == "personajes"
						? (prefs.rolIglesia_id = configCons.cfc = 1 ? {[Op.notLike]: "NN%"} : {[Op.like]: "NN%"})
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
			if (!usuario_id) return null;

			// Obtiene la condición
			let condicion = {usuario_id};
			if (configCons.pppOpciones && configCons.pppOpciones != sinPreferencia.id)
				condicion.opcion_id = configCons.pppOpciones; // Si el usuario eligió una preferencia y es distinta a 'sinPreferencia', restringe la búsqueda a los registros con esa 'opcion_id'

			// Obtiene los registros
			let pppRegistros = BD_genericas.obtieneTodosPorCondicionConInclude("ppp_registros", condicion, "detalle");

			// Fin
			return pppRegistros;
		},
		momentoDelAno: async ({dia, mes}) => {
			// Variables
			const entidadesRCLV = variables.entidades.rclvs.slice(0, -1); // Descarta la última entidad (epocaDelAno)
			const diaInicial_id = diasDelAno.find((n) => n.dia == dia && n.mes_id == mes).id;
			let registros = [];
			let condicion;

			// Rutina para obtener los RCLVs de los días 0, +1, +2
			for (let dia = 0; dia < 3; dia++) {
				// Variables
				let diaDelAno_id = diaInicial_id + dia;
				if (diaDelAno_id > 366) diaDelAno_id -= 366;

				// Obtiene los RCLV sin 'epocaDelAno'
				for (let entidad of entidadesRCLV) {
					// Condicion estandar: RCLVs del dia y en status aprobado
					condicion = {id: {[Op.gt]: 10}, diaDelAno_id, statusRegistro_id: aprobado_id};

					// Obtiene los registros
					registros.push(
						BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
							// Les agrega su entidad y el dia
							.then((n) => n.map((m) => ({...m, entidad, dia})))
					);
				}

				// Busca el registro de 'epocaDelAno'
				const epocaDelAno_id = diasDelAno.find((n) => n.id == diaDelAno_id).epocaDelAno_id;
				if (epocaDelAno_id != 1) {
					const condicion = {id: epocaDelAno_id, statusRegistro_id: aprobado_id};
					registros.push(
						BD_genericas.obtieneTodosPorCondicion("epocasDelAno", condicion)
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
			if (rclvs.length) rclvs.sort((a, b) => a.dia - b.dia); // Momento ascendente

			// Fin
			return rclvs;
		},
		cruce: {
			prodsConPPP: ({prods, pppRegistros, configCons}) => {
				if (!prods.length) return [];

				// Si se cumple un conjunto de condiciones, se borran todos los productos y termina la función
				if (configCons.pppOpciones && configCons.pppOpciones != sinPreferencia.id && !pppRegistros.length) return [];

				// Rutina por producto
				for (let i = prods.length - 1; i >= 0; i--) {
					// Averigua si el producto tiene un registro de preferencia
					const existe = pppRegistros.find((n) => n.entidad == prods[i].entidad && n.entidad_id == prods[i].id);

					// Acciones si se eligió un tipo de preferencia
					if (configCons.pppOpciones) {
						// Variable
						const pppOpcionElegida = pppOpciones.find((n) => n.id == configCons.pppOpciones);

						// Elimina los registros que correspondan
						if (
							(pppOpcionElegida.id == sinPreferencia.id && existe) || // Si tienen alguna preferencia
							(pppOpcionElegida.id != sinPreferencia.id && !existe) // Si no tienen la preferencia elegida
						)
							prods.splice(i, 1);
						// Si no se eliminó, le agrega a los productos la ppp del usuario
						else prods[i] = {...prods[i], pppIcono: pppOpcionElegida.icono, pppNombre: pppOpcionElegida.nombre};
					}
					// Si no se eligió un tipo de preferencia, le agrega a los productos la ppp del usuario
					else {
						prods[i].pppIcono = existe ? existe.detalle.icono : sinPreferencia.icono;
						prods[i].pppNombre = existe ? existe.detalle.nombre : sinPreferencia.nombre;
					}
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
					// Obtiene el campo a buscar
					const campo_id = comp.obtieneDesdeEntidad.campo_id(rclv.entidad);

					// Detecta los hallazgos
					const hallazgos = prods.filter((n) => n[campo_id] == rclv.id);

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
			rclvsConProds: ({rclvs, prods}) => {
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
							const existe = prods.find((n) => n.entidad == entProd && n.id == prodRCLV.id);
							if (!existe) rclvs[i][entProd].splice(j, 1);
							else rclvs[i][entProd][j].entidad = entProd;
						}

						// Acciones finales
						rclvs[i].productos.push(...rclvs[i][entProd]); // Agrupa los productos en el array 'productos'
						delete rclvs[i][entProd]; // Elimina la familia
					}

					// Si el rclv no tiene productos, lo elimina
					if (!rclvs[i].productos.length) rclvs.splice(i, 1);
					// Acciones en caso contrario
					else {
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
				if (prods.length > 1 && orden.valor != "momento")
					prods.sort((a, b) =>
						configCons.ascDes == "ASC" ? a[orden.valor] - b[orden.valor] : b[orden.valor] - a[orden.valor]
					);

				// Fin
				return prods;
			},
			rclvs: ({rclvs, orden, configCons, entidad}) => {
				if (rclvs.length < 2) return rclvs;

				// Si el orden es por su Rol en la Iglesia, los ordena por su include
				if (orden.valor == "rolIglesia") rclvs.sort((a, b) => (a.rolIglesia.orden < b.rolIglesia.orden ? -1 : 1));
				// En los demás casos, ordena por su campo
				else
					configCons.ascDes == "ASC"
						? rclvs.sort((a, b) => (a[orden.valor] < b[orden.valor] ? -1 : 1))
						: rclvs.sort((a, b) => (a[orden.valor] > b[orden.valor] ? -1 : 1));

				// Si el orden es por año, los ordena adicionalmente por su época, porque algunos registros tienen su año en 'null'
				if (orden.valor.startsWith("ano"))
					configCons.ascDes == "ASC"
						? rclvs.sort((a, b) => (a.epocaOcurrencia.orden < b.epocaOcurrencia.orden ? -1 : 1))
						: rclvs.sort((a, b) => (a.epocaOcurrencia.orden > b.epocaOcurrencia.orden ? -1 : 1));

				// Fin
				return rclvs;
			},
		},
		camposNecesarios: {
			prods: (prods) => {
				// Si no hay registros a achicar, interrumpe la función
				if (!prods.length) return [];

				// Deja solamente los campos necesarios
				prods = prods.map((n) => {
					// Obtiene campos simples
					const {entidad, id, nombreCastellano, pppIcono, pppNombre, direccion, anoEstreno, avatar} = n;
					let datos = {entidad, id, nombreCastellano, pppIcono, pppNombre, direccion, anoEstreno, avatar};

					// Achica el campo dirección
					if (direccion && direccion.indexOf(",") > 0) datos.direccion = direccion.slice(0, direccion.indexOf(","));

					// Obtiene el nombre de la entidad
					datos.entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

					// Si es una colección, agrega el campo 'anoFin'
					if (n.entidad == "colecciones") datos.anoFin = n.anoFin;

					// Fin
					return datos;
				});

				// Fin
				return prods;
			},
			rclvs: ({rclvs, entidad}) => {
				// Si no hay registros a achicar, interrumpe la función
				if (!rclvs.length) return [];

				// Deja solamente los campos necesarios
				rclvs = rclvs.map((n) => {
					// Arma el resultado
					const {id, nombre, diaDelAno_id, productos} = n;
					let datos = {id, nombre, diaDelAno_id, productos};

					// Obtiene campos en función de la entidad
					if (entidad == "personajes") {
						datos.epocaOcurrencia_id = n.epocaOcurrencia_id;
						datos.anoNacim = n.anoNacim;
						datos.rolIglesia = n.rolIglesia.nombre;
						datos.canon = n.canon.nombre;
					}
					if (entidad == "hechos") {
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
