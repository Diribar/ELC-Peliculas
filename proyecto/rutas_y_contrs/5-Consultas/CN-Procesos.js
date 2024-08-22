"use strict";
// Variables

module.exports = {
	varios: {
		cabeceras: async (userId) => {
			// Obtiene la cabecera de las configuraciones propias y las provistas por el sistema
			const usuario_id = userId ? [1, userId] : 1;
			const regsCabecera = await baseDeDatos.obtieneTodosPorCondicion("consRegsCabecera", {usuario_id});
			regsCabecera.sort((a, b) => (a.nombre < b.nombre ? -1 : 1)); // los ordena alfabéticamente

			// Fin
			return regsCabecera;
		},
		filtros: async () => {
			// Variable 'filtros'
			let filtros = {...variables.filtrosCons};

			// Agrega los filtros de código y opciones
			for (let prop in filtros) {
				// Le agrega el nombre del campo a cada método
				filtros[prop].codigo = prop;

				// Agrega las opciones que correspondan
				if (!filtros[prop].opciones) {
					// Si es el prop 'epocasOcurrencia', quita la opción 'varias'
					if (prop == "epocasOcurrencia")
						filtros.epocasOcurrencia.opciones = epocasOcurrencia
							.filter((n) => n.id != "var")
							.map((n) => ({id: n.id, nombre: n.consulta}));
					else if (prop == "temas") filtros.temas.opciones = await comp.filtrosConsTemas();
					else filtros[prop].opciones = global[prop];
				}
			}

			// Fin
			return filtros;
		},
		prefs_BD: async ({usuario, cabecera_id}) => {
			// Obtiene el configCons_id del usuario
			if (!cabecera_id) cabecera_id = usuario && usuario.configCons_id ? usuario.configCons_id : "";

			// Obtiene las preferencias
			let prefs = {};
			const registros = await baseDeDatos.obtieneTodosPorCondicion("consRegsPrefs", {cabecera_id});
			for (let registro of registros) prefs[registro.campo] = registro.valor; // convierte el array en objeto literal

			// Fin
			return {cabecera_id, ...prefs};
		},
		ayudas: (userId) => {
			// Variables
			let resultado = [];

			// Obtiene las ayudas sin repetir
			cnLayouts
				.map((n) => ({nombre: n.nombre, comentario: n.ayuda}))
				.filter((n) => n.comentario)
				.filter((n) => (!userId ? !n.nombre.startsWith("Mis") : true)) // si el usuario no está logueado, quita las ayudas "Mis"
				.map((n) => {
					if (!resultado.find((m) => m.nombre == n.nombre)) resultado.push(n);
				});

			// Fin
			return resultado;
		},
		configCons_url: (req, res) => {
			// Variables
			const configCons = req.query;
			const userId = req.session.usuario ? req.session.usuario.id : null;

			// Guarda la configuracion en cookies y session
			req.session.configCons = configCons;
			res.cookie("configCons", configCons, {maxAge: unDia});

			// Guarda la 'configCons_id' en el usuario
			const configCons_id = configCons.id;
			if (configCons_id && userId) {
				baseDeDatos.actualizaPorId("usuarios", userId, {configCons_id});
				req.session.usuario = {...req.session.usuario, configCons_id};
			}

			// Fin
			return;
		},
		eliminaSessionCookie: (req, res) => {
			delete req.session.configCons;
			res.clearCookie("configCons");
			return;
		},
	},
	resultados: {
		obtieneProds: {
			comun: async function (prefs) {
				// Variables
				const {entidad, layout} = prefs;
				const entsProd = variables.entidades.prods;
				let productos = [];
				let include = [];

				// Include - simple
				if (layout.codigo == "catalogoEstreno") include.push("epocaEstreno");
				if (layout.codigo == "anoOcurrencia") include.push("epocaOcurrencia");
				if (layout.codigo == "azar") include.push("prodComplem");

				// Include - complejo
				if (!layout.codigo.startsWith("fechaDelAno")) include.push(...variables.entidades.asocRclvs);
				if (["rolesIgl", "canons"].some((n) => Object.keys(prefs).includes(n))) include.push("personaje");
				if (prefs.apMar) include.push("personaje", "hecho");

				// Condiciones
				const filtros = this.filtros(prefs);
				let condicion = {statusRegistro_id: aprobados_ids, ...filtros};
				if (["calificacion", "misCalificadas"].includes(layout.codigo)) condicion.calificacion = {[Op.ne]: null}; // Para la opción 'calificación', agrega pautas en las condiciones
				const campo_id = !["productos", "rclvs"].includes(entidad) ? comp.obtieneDesdeEntidad.campo_id(entidad) : null; // si es una entidad particular, obtiene el nombre del 'campo_id'
				if (campo_id) condicion[campo_id] = {[Op.ne]: 1}; // Si son productos de RCLVs, el 'campo_id' debe ser distinto a 'uno'

				// Obtiene los productos
				for (let entProd of entsProd) {
					if (entProd == "capitulos") condicion.capEnCons = true;
					productos.push(
						baseDeDatos
							.obtieneTodosPorCondicion(entProd, condicion, include)
							.then((n) => n.map((m) => ({...m, entidad: entProd})))
					);
				}
				productos = await Promise.all(productos).then((n) => n.flat());

				// Aplica otros filtros
				if (productos.length) productos = this.otrosFiltros({productos, prefs, campo_id});

				// Fin
				return productos;
			},
			filtros: (prefs) => {
				// Variables
				const {filtrosCons} = variables;
				const {idiomas} = filtrosCons;
				let filtros = {};

				// Transfiere las preferencias simples a las condiciones
				for (let prop in prefs) {
					const campoFiltro = filtrosCons[prop] ? filtrosCons[prop].campoFiltro : null;
					if (campoFiltro) filtros[campoFiltro] = prefs[prop]; // sólo los filtros que tienen un 'campoFiltro'
				}

				// Conversión de 'idiomas'
				if (prefs.idiomas) {
					const condic = idiomas.opciones.find((n) => n.id == prefs.idiomas).condic; // obtiene las condiciones de idioma
					if (condic) {
						const tiposLink = prefs.tiposLink == "conLinksHD" ? "conLinksHD" : "conLinks"; // obtiene la condición dentro de las condiciones
						filtros = {...filtros, ...condic[tiposLink]};
					}
				}

				// Conversión de campos con condición
				for (let campo of ["tiposLink", "publicos", "miscelaneas"])
					if (prefs[campo]) {
						const condic = filtrosCons[campo].opciones.find((n) => n.id == prefs[campo]).condic;
						if (condic) filtros = {...filtros, ...condic};
					}

				// Fin
				return filtros;
			},
			otrosFiltros: ({productos, prefs, campo_id}) => {
				// Variables
				const {apMar, rolesIgl, canons, entidad, cfc} = prefs;

				// Filtros generales
				if (rolesIgl || canons) {
					// Quita los personajes menores que 11
					productos = productos.filter((n) => n.personaje_id > 10);

					// Filtra por rolesIgl
					if (rolesIgl)
						productos =
							rolesIgl == "RS"
								? productos.filter((n) => ["RE", "SC"].some((m) => n.personaje.rolIglesia_id.startsWith(m)))
								: productos.filter((n) => n.personaje.rolIglesia_id.startsWith(rolesIgl));

					// Filtra por canons
					if (canons)
						productos =
							canons == "SB"
								? productos.filter((n) => ["ST", "BT"].some((m) => n.personaje.canon_id.startsWith(m))) // Santos y Beatos
								: canons == "VS"
								? productos.filter((n) => ["VN", "SD"].some((m) => n.personaje.canon_id.startsWith(m))) // Venerables y Siervos de Dios
								: canons == "TD"
								? productos.filter((n) => n.personaje.canon_id != "NN") // Todos (Santos a Siervos)
								: productos.filter((n) => n.personaje.canon_id == "NN"); // Sin proceso de canonización
				}

				// Filtra por apMar
				if (apMar) {
					// Quita los personajes y hechos menores que 11
					productos = productos.filter((n) => n.personaje_id > 10 || n.hecho_id > 10);

					// Ajustes más finos
					productos =
						apMar == "SI"
							? productos.filter(
									(n) => (n.personaje && n.personaje.apMar_id != 10) || (n.hecho && n.hecho.ama == 1)
							  )
							: productos.filter(
									(n) => (n.personaje && n.personaje.apMar_id == 10) || (n.hecho && n.hecho.ama == 0)
							  );
				}

				// cfc / vpc
				if (cfc) productos = productos.filter((n) => (cfc == "1" ? n.cfc : !n.cfc)); // incluye los null

				// Filtra por entidad
				if (campo_id) productos = productos.filter((n) => n.entidad == entidad);

				// Fin
				return productos;
			},
		},
		obtieneRclvs: {
			consolidado: function (prefs) {
				if (prefs.entidad == "productos") return null;
				return prefs.layout.codigo.startsWith("fechaDelAno") ? this.porFechaDelAno(prefs) : this.comun(prefs);
			},
			comun: async function (prefs) {
				// Variables
				const {rolesIgl, canons, layout} = prefs;
				let {entidad} = prefs;
				let rclvs = [];

				// Interrumpe la función o cambia la entidad
				if (rolesIgl || canons) {
					if (entidad == "rclvs") entidad = "personajes";
					if (entidad != "personajes") return [];
				}

				// Obtiene los RCLVs
				if (entidad == "rclvs") {
					// Variables para todos los 'rclvs'
					const entidadesRCLV =
						layout.codigo == "anoOcurrencia"
							? ["personajes", "hechos"] // son las únicas entidades que tienen el año histórico en que ocurrió
							: [...variables.entidades.rclvs];

					// Rutina por RCLV
					for (let rclvEnt of entidadesRCLV) {
						// Obtiene los registros
						const {condicion, include} = this.obtieneIncludeCondics(rclvEnt, prefs);
						rclvs.push(
							baseDeDatos
								.obtieneTodosPorCondicion(rclvEnt, condicion, include)
								.then((n) => n.filter((m) => m.peliculas.length || m.colecciones.length || m.capitulos.length))
								.then((n) => n.map((m) => ({...m, entidad: rclvEnt})))
						);
					}
					rclvs = await Promise.all(rclvs).then((n) => n.flat());
				}

				// Rutina para un sólo RCLV
				else {
					const {condicion, include} = this.obtieneIncludeCondics(entidad, prefs);
					rclvs = await baseDeDatos
						.obtieneTodosPorCondicion(entidad, condicion, include)
						.then((n) => n.filter((m) => m.peliculas.length || m.colecciones.length || m.capitulos.length))
						.then((n) => n.map((m) => ({...m, entidad})));
				}

				// Para la opción 'Año de Ocurrencia' estandariza el campo
				if (layout.codigo == "anoOcurrencia")
					rclvs = rclvs.map((n) => ({
						...n,
						anoOcurrencia: n.anoNacim ? n.anoNacim : n.anoComienzo ? n.anoComienzo : null,
					}));

				// Fin
				return rclvs;
			},
			obtieneIncludeCondics: function (entidad, prefs) {
				// Include
				let include = [...variables.entidades.prods];
				if (["personajes", "hechos"].includes(entidad)) include.push("epocaOcurrencia");
				if (entidad == "personajes") include.push("rolIglesia", "canon");

				// Obtiene las condiciones
				const filtros = ["personajes", "hechos"].includes(entidad) ? this.filtros(entidad, prefs) : null;
				const condicion = {statusRegistro_id: aprobado_id, id: {[Op.gt]: 10}, ...filtros}; // Status aprobado e ID mayor a 10

				// Fin
				return {include, condicion};
			},
			filtros: (entidad, prefs) => {
				// Variables - la entidad tiene que ser aparte para diferenciarla de 'rclvs'
				const {layout} = prefs;
				const {apMar, rolesIgl, canons} = variables.filtrosCons;
				let filtros = {};

				// Si la opción es 'Por fecha en que se lo recuerda'
				if (layout.codigo.startsWith("fechaDelAno")) filtros.fechaDelAno_id = {[Op.lt]: 400};

				// Época de ocurrencia
				if (prefs.epocasOcurrencia) filtros.epocaOcurrencia_id = prefs.epocasOcurrencia;

				// Aparición mariana
				if (prefs.apMar) {
					const condicion = apMar.opciones.find((n) => n.id == prefs.apMar).condic;
					entidad == "personajes" ? (filtros.apMar_id = condicion.pers) : (filtros.ama = condicion.hec);
				}

				// Roles en la Iglesia
				if (entidad == "personajes" && prefs.rolesIgl)
					filtros.rolIglesia_id = rolesIgl.opciones.find((n) => n.id == prefs.rolesIgl).condic;

				// Canonización
				if (entidad == "personajes" && prefs.canons)
					filtros.canon_id = canons.opciones.find((n) => n.id == prefs.canons).condic;

				// Fin
				return filtros;
			},
			porFechaDelAno: async (prefs) => {
				// Variables
				const {entidad, dia, mes} = prefs;
				const entidadesRCLV = entidad != "rclvs" ? [entidad] : variables.entidades.rclvs;
				const diaHoy = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes);
				const inclStd = ["fechaDelAno"];
				const inclHec = [...inclStd, "epocaOcurrencia"];
				const inclPers = [...inclHec, "rolIglesia", "canon"];
				let rclvs = [];

				// Rutina para obtener los RCLVs
				for (let entidadRCLV of entidadesRCLV) {
					// Variables
					const condicion = {statusRegistro_id: aprobado_id, fechaDelAno_id: {[Op.ne]: 400}};
					const includes = entidadRCLV == "hechos" ? inclHec : entidadRCLV == "personajes" ? inclPers : inclStd;

					// Obtiene los rclvs y les agrega la entidadRCLV
					rclvs.push(
						baseDeDatos
							.obtieneTodosPorCondicion(entidadRCLV, condicion, includes)
							.then((n) => n.map((m) => ({...m, entidad: entidadRCLV})))
					);
				}
				rclvs = await Promise.all(rclvs).then((n) => n.flat());

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
						.sort((a, b) => a.fechaDelAno_id - b.fechaDelAno_id) // Día ascendente
						.sort((a, b) =>
							// Año ascendente
							(!a.anoFM || a.anoFM == anoHoy) && b.anoFM > anoHoy
								? -1
								: a.anoFM > anoHoy && (!b.anoFM || b.anoFM == anoHoy)
								? 1
								: 0
						);

					// Para los botones, mueve los pasados al futuro
					if (prefs.layout.codigo == "fechaDelAnoBoton") {
						const indice = rclvs.findIndex((n) => n.fechaDelAno_id >= diaHoy.id);
						if (indice > 0) {
							const pasados = rclvs.slice(0, indice);
							rclvs.splice(0, indice);
							rclvs.push(...pasados);
						}
					}

					// Elimina los registros con el nombre repetido
					if (rclvs.length > 1)
						for (let i = rclvs.length - 2; i > 0; i--)
							if (rclvs[i].nombre == rclvs[i + 1].nombre) rclvs.splice(i + 1, 1);
				}

				// Fin
				return rclvs;
			},
		},
		cruce: {
			// Productos
			prodsConPPP: ({prods, pppRegistros, prefs, usuario_id, layout}) => {
				// Interrumpe la función
				if (!prods.length) return [];
				if (!usuario_id) return layout.codigo != "misPrefs" ? prods : [];

				// Variables
				const {pppOpciones: pppOpcion} = prefs;

				// Si se cumple un conjunto de condiciones, se borran todos los productos y termina la función
				if (
					pppOpcion && // se eligió una opción
					pppOpcion != "todos" && // no se eligió la opción "Todas las preferencias"
					!pppOpcion.includes(String(pppOpcsObj.sinPref.id)) && // la opción elegida no incluye a 'sinPref'
					!pppRegistros.length // no hay registros 'ppp'
				)
					return [];

				// Rutina por producto
				for (let i = prods.length - 1; i >= 0; i--) {
					// Averigua si el producto tiene un registro de preferencia del usuario
					let pppRegistro = pppRegistros.find((n) => n.entidad == prods[i].entidad && n.entidad_id == prods[i].id);

					// Si no tiene pppRegistro y es un capítulo, asume el de la colección
					if (!pppRegistro && prods[i].entidad == "capitulos")
						pppRegistro = pppRegistros.find(
							(n) => n.entidad == "colecciones" && n.entidad_id == prods[i].coleccion_id
						);

					// Acciones si se eligió un tipo de preferencia
					if (pppOpcion && pppOpcion != "todos") {
						// Elimina los registros que correspondan
						if (
							(pppRegistro && !pppOpcion.includes(String(pppRegistro.ppp_id))) || // tiene alguna preferencia que no es la que se había elegido
							(!pppRegistro && !pppOpcion.includes(String(pppOpcsObj.sinPref.id))) // no tiene una preferencia y no se eligió 'sinPref'
						)
							prods.splice(i, 1);
						// Si no se eliminó, le agrega a los productos la 'ppp' del usuario
						else {
							// Variable
							const pppOpcionElegida =
								pppOpcion == pppOpcsObj.sinPref.id || !pppRegistro
									? pppOpcsObj.sinPref // si se eligió 'sin preferencia' o no hay un registro
									: pppOpcsArray.find((n) => n.id == pppRegistro.ppp_id); // elige la opción del producto que coincide con la elegida

							// Le agrega a los productos la 'ppp' del usuario
							prods[i].ppp = pppOpcionElegida;

							// Le agrega datos adicionales si se eligió la opción 'misPrefs'
							if (layout.codigo == "misPrefs") {
								prods[i].ppp_id = pppOpcionElegida.id;
								//prods[i].misPrefs = pppRegistro.creadoEn;
								prods[i].yaLaVi = pppOpcionElegida.codigo == pppOpcsObj.yaLaVi.codigo;
								prods[i].laQuieroVer = pppOpcionElegida.codigo == pppOpcsObj.laQuieroVer.codigo;
							}
						}
					}
					// Si no se eligió un tipo de preferencia, le agrega a los productos la ppp del usuario
					else prods[i].ppp = pppRegistro ? pppRegistro.detalle : pppOpcsObj.sinPref;
				}

				// Fin
				return prods;
			},
			prodsConRCLVs: ({prods, rclvs}) => {
				// Interrumpe la función
				if (!rclvs) return prods; // Si no se pidió cruzar contra RCLVs, devuelve la variable intacta
				if (!prods.length || !rclvs.length) return []; // Si no hay RCLVs, reduce a cero los productos

				// Para cada RCLV, busca los productos
				let prodsCruzadosConRCLVs = [];
				for (let rclv of rclvs) {
					// Variables
					const campo_id = comp.obtieneDesdeEntidad.campo_id(rclv.entidad);
					const hallazgos = prods.filter((n) => n[campo_id] == rclv.id);
					const asoc = comp.obtieneDesdeEntidad.asociacion(rclv.entidad);
					const fechaDelAno = rclv.fechaDelAno.nombre;

					// Acciones si se encontraron hallazgos
					if (hallazgos.length) {
						prodsCruzadosConRCLVs.push(...hallazgos.map((n) => ({...n, [asoc]: {...n[asoc], fechaDelAno}}))); // los agrega
						prods = prods.filter((n) => n[campo_id] != rclv.id); // los elimina de prods para que no se dupliquen
					}
				}

				// Fin
				return prodsCruzadosConRCLVs;
			},
			prodsConPalsClave: ({prods, palabrasClave}) => {
				if (!prods.length) return [];
				if (!palabrasClave) return prods;

				// Variables
				palabrasClave = palabrasClave.toLowerCase();

				// Rutina por producto
				for (let i = prods.length - 1; i >= 0; i--) {
					// Variables
					const prod = prods[i];

					// Busca las 'palsClave' dentro de sus campos simples
					for (let campo in prod)
						if (
							prod[campo] && // que tenga un valor
							typeof prod[campo] == "string" &&
							prod[campo].toLowerCase().includes(palabrasClave)
						) {
							prods[i].palsClave = true;
							break;
						}

					// Busca las 'palsClave' dentro de sus campos include
					if (!prods[i].palsClave)
						for (let entRclv of variables.entidades.asocRclvs)
							for (let campo in entRclv)
								if (
									prod[entRclv][campo] && // que tenga un valor
									typeof prod[entRclv][campo] == "string" &&
									prod[entRclv][campo].toLowerCase().includes(palabrasClave)
								)
									prods[i].palsClave = true;

					// Si el producto no tiene las palsClave, lo elimina
					if (!prods[i].palsClave) prods.splice(i, 1);
				}

				// Fin
				return prods;
			},
			prodsConMisCalifs: async ({prods, usuario_id, layout}) => {
				// Interrupciones de la función
				if (layout.codigo != "misCalificadas") return prods;
				if (!prods.length || !usuario_id) return [];

				// Obtiene los registros del usuario
				const misCalificadas = await baseDeDatos.obtieneTodosPorCondicion("calRegistros", {usuario_id});
				const yaVistas = await baseDeDatos.obtieneTodosPorCondicion("pppRegistros", {
					usuario_id,
					ppp_id: pppOpcsObj.yaLaVi.id,
				});

				// Elimina los productos no calificados ni vistos
				for (let i = prods.length - 1; i >= 0; i--) {
					// Averigua si fue calificada y vista
					const calificada = misCalificadas.find((n) => n.entidad == prods[i].entidad && n.entidad_id == prods[i].id);
					const yaVista = yaVistas.find((n) => n.entidad == prods[i].entidad && n.entidad_id == prods[i].id);

					// Si no fue calificada ni vista, elimina el producto
					if (!calificada && !yaVista) prods.splice(i, 1);
					// Si fue calificada, agrega el resultado
					else if (calificada) prods[i].calificacion = calificada.resultado;
					// Si no fue calificada, le pone 'cero' como calificación
					else prods[i].calificacion = 0;
				}

				// Fin
				return prods;
			},
			prodsConMisConsultas: async ({prods, usuario_id, layout}) => {
				// Interrupciones de la función
				if (layout.codigo != "misConsultas") return prods;
				if (!prods.length || !usuario_id) return [];

				// Obtiene los registros del usuario
				let misConsultas = await baseDeDatos.obtieneTodosPorCondicion("misConsultas", {usuario_id});
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
			rclvsConProds: ({rclvs, prods}) => {
				// Cruza 'rclvs' con 'prods'
				if (!prods.length || !rclvs.length) return [];

				// Tareas por RCLV
				let i = 0;
				while (i < rclvs.length) {
					// Variables
					let rclv = rclvs[i];

					// Agrupa los productos en el método 'productos'
					const campo_id = comp.obtieneDesdeEntidad.campo_id(rclv.entidad);
					rclvs[i].productos = prods.filter((n) => n[campo_id] == rclv.id);

					// Si el rclv no tiene productos, lo elimina
					if (!rclvs[i].productos.length) rclvs.splice(i, 1);
					// Acciones en caso contrario
					else {
						// Ordena los productos por su año de estreno
						rclvs[i].productos.sort((a, b) => b.anoEstreno - a.anoEstreno);

						// Deja solamente los campos necesarios
						rclvs[i].productos = rclvs[i].productos.map((n) => {
							// Obtiene campos simples
							let {entidad, id, nombreCastellano, ppp, direccion, anoEstreno} = n;
							let datosProd = {entidad, id, nombreCastellano, ppp, direccion, anoEstreno};

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
			rclvsConPalsClave: ({rclvs, palabrasClave}) => {
				if (!rclvs.length) return [];
				if (!palabrasClave) return rclvs;

				// Variables
				palabrasClave = palabrasClave.toLowerCase();

				// Rutina por rclv
				for (let i = rclvs.length - 1; i >= 0; i--) {
					// Variables
					const rclv = rclvs[i];

					// Busca las 'palsClave' dentro de sus campos simples
					for (let campo in rclv)
						if (
							rclv[campo] && // tiene un valor
							typeof rclv[campo] == "string" &&
							rclv[campo].toLowerCase().includes(palabrasClave)
						) {
							rclvs[i].palsClave = true;
							break;
						}

					// Busca las 'palsClave' dentro de sus productos
					if (!rclvs[i].palsClave)
						for (let j = rclv.productos.length - 1; j >= 0; j--) {
							// Variables
							const producto = rclv.productos[j];

							// Acciones si el producto tiene las 'palabrasClave'
							for (let campo in producto) {
								if (
									producto[campo] && // tiene un valor
									typeof producto[campo] == "string" &&
									producto[campo].toLowerCase().includes(palabrasClave)
								) {
									rclvs[i].palsClave = true;
									producto.palsClave = true;
									break;
								}
							}

							// Si el producto no tiene las 'palabrasClave', lo elimina del rclv
							if (!producto.palsClave) rclvs[i].productos.splice(j, 1);
						}

					// Si el rclv no tiene las palsClave, lo elimina
					if (!rclvs[i].palsClave) rclvs.splice(i, 1);
				}

				// Fin
				return rclvs;
			},
		},
		orden: {
			prods: ({prods, layout}) => {
				// Si corresponde, interrumpe la función y ordena por el azar decreciente
				if (layout.codigo == "azar")
					return prods.sort((a, b) =>
						b.prodComplem && a.prodComplem
							? b.prodComplem.azar - a.prodComplem.azar
							: b.prodComplem
							? -1
							: a.prodComplem
							? 1
							: 0
					);

				// Variables
				const campo = false
					? false
					: ["nombre", "catalogoNombre"].includes(layout.codigo)
					? "nombreCastellano"
					: layout.codigo == "catalogoEstreno"
					? "anoEstreno"
					: layout.codigo == "misCalificadas"
					? "calificacion"
					: layout.codigo == "misConsultas"
					? "fechaConsulta"
					: layout.codigo.startsWith("fechaDelAno")
					? "fechaDelAno_id"
					: layout.codigo;

				// Ordena
				const menorPrimero = layout.ascDes == "ASC" ? -1 : 1;
				prods.sort((a, b) =>
					false
						? false
						: typeof a[campo] == "string" && b[campo] == "string"
						? a[campo].toLowerCase() < b[campo].toLowerCase() // acciones para strings
							? menorPrimero
							: -menorPrimero
						: a[campo] < b[campo] // acciones para 'no strings'
						? menorPrimero
						: -menorPrimero
				);

				// Orden adicional para "misPrefs"
				if (layout.codigo == "misPrefs") {
					prods.sort((a, b) => (a.yaLaVi && !b.yaLaVi ? -1 : 0));
					prods.sort((a, b) => (a.laQuieroVer && !b.laQuieroVer ? -1 : 0));
				}

				// Fin
				return prods;
			},
			rclvs: ({rclvs, layout}) => {
				// Si no corresponde ordenar, interrumpe la función
				if (rclvs.length <= 1 || layout.codigo.startsWith("fechaDelAno")) return rclvs;

				// Particularidad para el Año de Ocurrencia
				if (layout.codigo == "anoOcurrencia") {
					rclvs.sort((a, b) => b.anoOcurrencia - a.anoOcurrencia);
					rclvs.sort((a, b) => b.epocaOcurrencia.orden - a.epocaOcurrencia.orden);
				}
				// En los demás casos, ordena por su campo
				else
					rclvs.sort((a, b) =>
						typeof a[layout.codigo] == "string" && b[layout.codigo] == "string"
							? layout.ascDes == "ASC"
								? a[layout.codigo].toLowerCase() < b[layout.codigo].toLowerCase()
									? -1
									: 1
								: a[layout.codigo].toLowerCase() > b[layout.codigo].toLowerCase()
								? -1
								: 1
							: layout.ascDes == "ASC"
							? a[layout.codigo] < b[layout.codigo]
								? -1
								: 1
							: a[layout.codigo] > b[layout.codigo]
							? -1
							: 1
					);

				// Fin
				return rclvs;
			},
		},
		descartaCapitulosSiColeccionPresente: {
			prods: (resultados) => {
				// Rutina por producto
				const colecciones = resultados.filter((n) => n.entidad == "colecciones");
				for (let coleccion of colecciones) resultados = resultados.filter((n) => n.coleccion_id != coleccion.id);

				// Fin
				return resultados;
			},
			rclvs: (rclvs) => {
				// Rutina por rclv
				rclvs.forEach((rclv, i) => {
					const colecciones = rclv.productos ? rclv.productos.filter((n) => n.entidad == "colecciones") : [];
					for (let coleccion of colecciones)
						rclvs[i].productos = rclv.productos.filter((n) => n.coleccion_id != coleccion.id);
				});

				// Fin
				return rclvs;
			},
		},
		botonesListado: ({resultados, layout, prefs}) => {
			// Variables
			const cantResults = layout.cantidad;

			// Botones
			if (layout.codigo == "azar") resultados = alAzar.consolidado({resultados, cantResults, prefs});
			else if (cantResults) resultados.splice(cantResults);

			// Fin
			return resultados;
		},
		camposNecesarios: {
			prods: ({prods, layout}) => {
				// Si no hay registros a achicar, interrumpe la función
				if (!prods.length) return [];

				// Deja solamente los campos necesarios
				prods = prods.map((prod) => {
					// Obtiene campos simples
					const {entidad, id, nombreCastellano, ppp, avatar, cfc, epocaEstreno, coleccion_id} = prod;
					let {direccion, anoEstreno} = prod;
					if (!direccion) direccion = "desconocido";
					if (!anoEstreno) anoEstreno = "0 (desconocido)";
					let datosProd = {entidad, id, nombreCastellano, ppp};
					datosProd = {...datosProd, direccion, anoEstreno, avatar, cfc};
					if (Object.keys(prod).includes("calificacion")) datosProd.calificacion = prod.calificacion;
					if (epocaEstreno) datosProd.epocaEstreno = epocaEstreno.nombre;
					if (coleccion_id) datosProd.coleccion_id = coleccion_id;

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
							(!layout.codigo.includes("fechaDelAno_id") || prod[asociacion].fechaDelAno) // no se busca por fecha o el campo tiene fecha
						) {
							datosProd[entidadNombre] = prod[asociacion].nombre;
							if (layout.codigo.startsWith("fechaDelAno") && entRclv != "epocasDelAno")
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
			rclvs: (rclvs) => {
				// Si no hay registros, interrumpe la función
				if (!rclvs.length) return [];

				// Deja solamente los campos necesarios
				rclvs = rclvs.map((rclv) => {
					// Arma el resultado
					const {entidad, id, nombre, productos, avatar} = rclv; // necesarios
					const {fechaDelAno_id, fechaDelAno, anoOcurrencia, epocaOcurrencia_id, epocaOcurrencia} = rclv; // eventuales
					const {categoria_id, soloCfc} = rclv; // eventuales
					let datosRclv = {entidad, id, nombre, productos, avatar};

					// Casos especiales
					if (rclv.nombreAltern) datosRclv.nombreAltern = rclv.nombreAltern;
					if (fechaDelAno) datosRclv = {...datosRclv, fechaDelAno_id, fechaDelAno: fechaDelAno.nombre}; // hace falta la 'fechaDelAno_id' en el Front-End
					if (epocaOcurrencia)
						datosRclv = {...datosRclv, anoOcurrencia, epocaOcurrencia_id, epocaOcurrencia: epocaOcurrencia.consulta}; // hace falta la 'fechaDelAno_id' en el Front-End
					if (categoria_id == "CFC" || soloCfc) datosRclv.cfc = true;

					// Obtiene campos en función de la entidad
					if (entidad == "personajes" && rclv.rolIglesia_id != "NN") {
						datosRclv.rolIglesiaNombre = rclv.rolIglesia[rclv.genero_id];
						if (rclv.canon_id != "NN") datosRclv.canonNombre = rclv.canon[rclv.genero_id];
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
	consolidado: function ({resultados, cantResults, prefs}) {
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
			!prefs.cfc && // 'cfc' no está contestado
			!prefs.apMar && // 'apMar' no está contestado
			(!prefs.canons || prefs.canons == "NN") && // 'canons' no está contestado
			!prefs.rolesIgl; // 'rolesIgl' no está contestado

		// Elije los productos
		this.porAltaUltimosDias(v);
		const epocasEstrenoRecientes = epocasEstreno.slice(0, -1);
		for (let epocaEstreno of epocasEstrenoRecientes) this.porEpocaDeEstreno({epocaEstreno, v});

		// Agrega registros hasta llegar a cuatro
		let indice = 0;
		while (v.contador < 4 && v.resultados.length && indice < v.resultados.length) {
			v.resultado = v.resultados[indice];
			if (
				!v.seDebeEquilibrar || // no se debe equilibrar
				(v.resultado.cfc && v.cfc < 2) || // se debe equilibrar y no se alcanzaron los 2 resultados 'cfc'
				(!v.resultado.cfc && v.vpc < 2) // se debe equilibrar y no se alcanzaron los 2 resultados 'vpc'
			)
				this.agregaUnBoton(v);
			else indice++;
		}
		while (v.contador < 4 && v.resultados.length) {
			v.resultado = v.resultados[0];
			this.agregaUnBoton(v);
		}

		// Ordena los resultados
		v.productos.sort((a, b) => b.anoEstreno - a.anoEstreno);

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
		const epoca_id = epocaEstreno.id;
		const suma = epoca_id < 3 ? 3 : 7; // la suma de los IDs posibles

		// Si ya existe un producto para esa epoca de estreno, termina la función
		if (v.productos.find((n) => n.epocaEstreno_id == epoca_id)) return;

		// Obtiene los productos de esa época de estreno
		v.resultado = v.resultados.filter((n) => n.epocaEstreno_id == epoca_id);

		// Si se debe equilibrar entre 'cfc' y 'vpc', se queda con los resultados que correspondan
		if (v.resultado.length && v.seDebeEquilibrar) {
			const seDebeElegirCfcVpc = v.productos.find((n) => n.epocaEstreno_id == suma - epoca_id);
			if (seDebeElegirCfcVpc) {
				const seDebeElegirCfc = seDebeElegirCfcVpc.cfc ? false : true;
				v.resultado = v.resultado.filter((n) => (seDebeElegirCfc ? n.cfc : !n.cfc)); // se debe escribir así para que se incluyan los null
			}
		}

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
