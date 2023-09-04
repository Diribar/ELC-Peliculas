"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/1-BD/Genericas");
const BD_especificas = require("../../funciones/1-BD/Especificas");
const comp = require("../../funciones/2-Procesos/Compartidas");
const variables = require("../../funciones/2-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Procesos");
const procesos = require("./PR-FN-Procesos");
const valida = require("./PR-FN-Validar");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_rud";
		const codigo = "detalle";

		// Variables
		const {entidad, id} = req.query;
		const origen = req.query.origen;
		const userID = req.session.usuario ? req.session.usuario.id : "";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const revisor = req.session.usuario && req.session.usuario.rolUsuario.revisorEnts;

		// Obtiene el producto 'Original' y 'Editado'
		const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		// Obtiene la versión más completa posible del producto
		const prodComb = {...original, ...edicion, id};
		// Configura el título de la vista
		const titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? " un " : " la ") +
			entidadNombre;
		// Info para el bloque Izquierdo
		// Primer proceso: hace más legible la información
		const infoProcesada = procesos.bloqueIzq(prodComb);
		// Segundo proceso: reagrupa la información
		let bloqueIzq = {masInfoIzq: [], masInfoDer: [], actores: infoProcesada.actores};
		if (infoProcesada.infoGral.length) {
			let infoGral = infoProcesada.infoGral;
			for (let i = 0; i < infoGral.length / 2; i++) {
				// Agrega un dato en 'masInfoIzq'
				bloqueIzq.masInfoIzq.push(infoGral[i]);
				// Agrega un dato en 'masInfoDer'
				let j = parseInt(infoGral.length / 2 + 0.5 + i);
				if (j < infoGral.length) bloqueIzq.masInfoDer.push(infoGral[j]);
			}
		}

		// RCLV
		const entidadesRCLV = variables.entidades.rclvs;
		const RCLVs = entidadesRCLV.map((n) => ({
			entidad: n,
			campo_id: comp.obtieneDesdeEntidad.campo_id(n),
			asociacion: comp.obtieneDesdeEntidad.asociacion(n),
		}));
		const rclvs_id = variables.entidades.rclvs_id;
		const asocs = variables.asocs.rclvs;
		for (let i = 0; i < asocs.length; i++)
			if (prodComb[rclvs_id[i]] != 1)
				bloqueIzq[asocs[i]] = procsRCLV.detalle.bloqueRCLV({entidad: entidadesRCLV[i], ...prodComb[asocs[i]]});
		const rclvsNombre = variables.entidades.rclvsNombre;

		// Info para el bloque Derecho
		const bloqueDer = procsCRUD.bloqueRegistro(prodComb);
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

		// Obtiene datos para la vista
		const status_id = original.statusRegistro_id;
		const statusEstable = [creadoAprob_id, aprobado_id].includes(status_id) || status_id == inactivo_id;
		const userIdentVal = req.session.usuario && req.session.usuario.statusRegistro.identValidada;
		if (entidad == "capitulos")
			prodComb.capitulos = BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
		let links = procesos.obtieneLinksDelProducto({entidad, id, userID});
		let interesDelUsuario = userID ? procesos.interesDelUsuario({usuario_id: userID, entidad, entidad_id: id}) : "";
		let yaCalificada = userID
			? BD_genericas.obtienePorCondicion("cal_registros", {usuario_id: userID, entidad, entidad_id: id}).then((n) => !!n)
			: "";
		[prodComb.capitulos, links, interesDelUsuario, yaCalificada] = await Promise.all([
			prodComb.capitulos,
			links,
			interesDelUsuario,
			yaCalificada,
		]);

		// Va a la vista
		// return res.send(prodComb);
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo: [], origen, revisor, userIdentVal},
			...{entidad, id, familia: "producto", status_id, statusEstable},
			...{entidadNombre, registro: prodComb, links, interesDelUsuario, yaCalificada},
			...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
			...{bloqueIzq, bloqueDer, RCLVs, asocs, rclvsNombre},
		});
	},
	edicion: {
		form: async (req, res) => {
			// Tema y Código
			const tema = "prod_rud";
			const codigo = "edicion";

			// Más variables
			const {entidad, id} = req.query;
			const origen = req.query.origen;
			const userID = req.session.usuario ? req.session.usuario.id : "";
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
			let imgDerPers, gruposPers, gruposHechos;
			let camposInput1, camposInput2, produccion, camposDA, paisesTop5;

			// Configura el título de la vista
			const titulo =
				(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
				" de" +
				(entidad == "capitulos" ? " un " : " la ") +
				entidadNombre;

			// Obtiene la versión más completa posible del producto
			const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
			let prodComb = {...original, ...edicion, id};
			if (req.session.edicProd) prodComb = {...prodComb, ...req.session.edicProd};
			delete req.session.edicProd;

			// Obtiene el nombre de los países
			const paisesNombre = original.paises_id ? comp.paises_idToNombre(original.paises_id) : "";

			// Info para la vista de Edicion o Detalle
			if (codigo == "edicion") {
				// Obtiene los datos de session/cookie y luego los elimina
				let edicSession;
				// Session
				if (req.session.edicProd) {
					if (req.session.edicProd.entidad == entidad && req.session.edicProd.id == id)
						edicSession = req.session.edicProd;
					else delete req.session.edicProd;
				}
				// Cookies
				if (req.cookies.edicProd && !edicSession) {
					if (req.cookies.edicProd.entidad == entidad && req.cookies.edicProd.id == id)
						edicSession = req.cookies.edicProd;
					else res.clearCookie("edicProd");
				}
				// Actualiza el producto prodComb
				prodComb = {...prodComb, ...edicSession};
				// Datos Duros - Campos Input
				let camposInput = variables.camposDD.filter((n) => n[entidad] || n.productos).filter((n) => n.campoInput);
				camposInput1 = camposInput.filter((n) => n.antesDePais);
				camposInput2 = camposInput.filter((n) => !n.antesDePais && n.nombre != "produccion");
				produccion = camposInput.find((n) => n.nombre == "produccion");
				// Datos Duros - Bases de Datos
				paisesTop5 = paises.sort((a, b) => b.cantProds - a.cantProds).slice(0, 5);
				// Datos Duros - Avatar
				imgDerPers = procsCRUD.obtieneAvatar(original, {...edicion, ...edicSession});

				// Datos Personalizados
				camposDA = await variables.camposDA_conValores(userID);
				gruposPers = procsCRUD.grupos.pers(camposDA);
				gruposHechos = procsCRUD.grupos.hechos(camposDA);
			}

			// Obtiene datos para la vista
			if (entidad == "capitulos")
				prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
			const ayudasTitulo = [
				"Los íconos de la barra azul de más abajo, te permiten editar los datos de esta vista y crear/editar los links.",
			];
			const status_id = original.statusRegistro_id;
			const revisor = req.session.usuario && req.session.usuario.rolUsuario.revisorEnts;

			// Va a la vista
			// return res.send(prodComb)
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, ayudasTitulo, origen, revisor},
				...{entidadNombre, entidad, id, familia: "producto", registro: prodComb},
				...{imgDerPers, status_id},
				...{camposInput1, camposInput2, produccion},
				...{paises, paisesTop5, idiomas, paisesNombre, camposDA, gruposPers, gruposHechos},
				...{omitirImagenDerecha: true, omitirFooter: true, cartelGenerico: true},
			});
		},
		guardar: async (req, res) => {
			// Variables
			const {entidad, id, origen} = req.query;
			const userID = req.session.usuario.id;
			const revisor = req.session.usuario && req.session.usuario.rolUsuario.revisorEnts;

			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let campo in req.body) if (!req.body[campo]) delete req.body[campo];
			for (let campo in req.body) if (typeof req.body[campo] == "string") req.body[campo] = req.body[campo].trim();

			// Si recibimos un avatar, se completa la información
			if (req.file) {
				req.body.avatar = req.file.filename;
				req.body.avatarUrl = req.file.originalname;
				req.body.tamano = req.file.size;
			}

			// Obtiene el producto 'Original' y 'Editado'
			let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
			const avatarEdicInicial = edicion.avatar;
			if (original.capitulos) delete original.capitulos;

			// Averigua si corresponde actualizar el original
			// 1. Tiene que ser un revisor
			// 2. El registro debe estar en el status 'creadoAprob'
			const actualizaOrig = revisor && original.statusRegistro.creadoAprob;

			// Averigua si hay errores de validación
			// 1. Se debe agregar el id del original, para verificar que no esté repetido
			// 2. Se debe agregar la edición, para que aporte su campo 'avatar'
			let prodComb = {...original, ...edicion, ...req.body, id};

			// Si es un revisor, agrega la obligatoriedad de que haya completado los campos 'epocaOcurrencia_id' y 'publico_id'
			prodComb.epocaOcurrencia = revisor;
			prodComb.publico = revisor;
			let errores = await valida.consolidado({datos: {...prodComb, entidad}});

			// Acciones si no hay errores
			if (!errores.hay) {
				// Acciones si corresponde actualizar el original
				if (actualizaOrig) {
					// Completa los datos a guardar
					prodComb.altaRevisadaPor_id = userID;
					prodComb.altaRevisadaEn = comp.fechaHora.ahora();

					// 1. Actualiza el registro original
					await BD_genericas.actualizaPorId(entidad, id, prodComb);

					// Actualiza los campos de los capítulos de una colección
					if (entidad == "colecciones") {
						// Variables
						let esperar = [];

						// Rutina por campo - sin 'await' y solo para los campos editados
						for (let campo in req.body)
							if (original[campo] != req.body[campo])
								esperar.push(procsCRUD.revisiones.transfiereDatos(original, req.body, campo));

						// Espera a que se corran todos los campos
						await Promise.all(esperar);
					}

					// 3. Elimina otras ediciones que tengan los mismos valores
					let edicsEliminadas = procsCRUD.revisiones.eliminaDemasEdiciones({entidad, original: prodComb, id});

					// 4. Se fija si corresponde cambiar el status
					let statusAprob = procsCRUD.revisiones.statusAprob({entidad, registro: prodComb});

					// Espera a que se completen las funciones con 'Promise'
					[statusAprob, edicsEliminadas] = await Promise.all([statusAprob, edicsEliminadas]);

					// Limpia el valor de la edicion, para que no se recargue el url
					edicion = null;
				}
				// De lo contrario, actualiza la edicion
				else {
					// Combina la información
					edicion = {...edicion, ...req.body};
					// 2. Guarda o actualiza la edición, y achica 'edición a su mínima expresión
					edicion = await procsCRUD.guardaActEdicCRUD({original, edicion, entidad, userID});
				}

				// Acciones sobre el archivo avatar, si recibimos uno
				if (req.file) {
					if (actualizaOrig) {
						// Mueve el archivo de la edición para reemplazar el original
						comp.gestionArchivos.mueveImagen(prodComb.avatar, "9-Provisorio", "2-Productos/Final");
						// Elimina el anterior archivo de imagen original
						if (original.avatar)
							comp.gestionArchivos.elimina("./publico/imagenes/2-Productos/Final/", original.avatar);
					} else {
						// Mueve el archivo de la edición para su revisión
						comp.gestionArchivos.mueveImagen(prodComb.avatar, "9-Provisorio", "2-Productos/Revisar");
						// Elimina el anterior archivo de imagen editada
						if (avatarEdicInicial)
							comp.gestionArchivos.elimina("./publico/imagenes/2-Productos/Revisar/", avatarEdicInicial);
					}
				}

				// Elimina los datos de la session
				delete req.session.edicProd;
			} else {
				// Si recibimos un archivo avatar editado, lo elimina
				if (req.file) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio/", req.file.filename);

				// Guarda los datos editados, sin el de avatar
				req.session.edicProd = req.body;
				delete req.session.edicProd.avatar;

				// Recarga la vista
				return res.redirect(req.originalUrl);
			}

			const entidadIdOrigen = "?entidad=" + entidad + "&id=" + id + (origen ? "&origen=" + origen : "");

			// Fin
			return edicion
				? res.redirect(req.originalUrl) // Recarga la vista
				: origen == "TE"
				? res.redirect("/inactivar-captura/" + entidadIdOrigen) // Regresa a Revisión
				: res.redirect(req.baseUrl + req.path + entidadIdOrigen); // Recarga la página sin la edición
		},
	},
	califica: {
		form: async (req, res) => {
			// Variables
			const tema = "prod_rud";
			const codigo = "calificar";
			const {entidad, id} = req.query;
			const origen = req.query.origen; // ? req.query.origen : "CAL";
			const userID = req.session.usuario ? req.session.usuario.id : "";
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

			// Obtiene la versión más completa posible del producto
			const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
			let prodComb = {...original, ...edicion, id};

			// Info para el bloque Derecho
			const bloqueDer = procsCRUD.bloqueRegistro(prodComb);
			const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

			// Info para la vista
			if (entidad == "capitulos")
				prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
			const titulo = "Calificar " + (entidad == "capitulos" ? "un " : "la ") + entidadNombre;
			const status_id = original.statusRegistro_id;
			const atributosTitulo = ["Deja Huella", "Entretiene", "Calidad Técnica"];
			const condics = {entidad, entidad_id: id, usuario_id: userID};
			const include = ["feValores", "entretiene", "calidadTecnica"];
			const califUsuario = await BD_genericas.obtienePorCondicionConInclude("cal_registros", condics, include);
			const interesDelUsuario = await procesos.interesDelUsuario({usuario_id: userID, entidad, entidad_id: id});

			// Va a la vista
			// return res.send(interesDelUsuario);
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, ayudasTitulo: [], origen},
				...{entidad, id, familia: "producto", status_id},
				...{entidadNombre, registro: prodComb, interesDelUsuario},
				...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
				...{bloqueDer, atributosTitulo, califUsuario},
			});
		},
		guardar: async (req, res) => {
			// Variables
			const {entidad, id: entidad_id, feValores_id, entretiene_id, calidadTecnica_id} = {...req.query, ...req.body};
			const userID = req.session.usuario.id;
			const condics = {usuario_id: userID, entidad, entidad_id};
			const valores = {usuario_id: userID, entidad, entidad_id, feValores_id, entretiene_id, calidadTecnica_id};

			// Verifica errores
			const errores = valida.calificar({feValores_id, entretiene_id, calidadTecnica_id});
			if (errores.hay) return res.redirect(req.originalUrl);

			// Obtiene el resultado
			let resultado = 0;
			for (let criterio of criteriosCalif) {
				const campo_id = criterio.atributo_id;
				const campo = criterio.atributo;
				const ponderacion = criterio.ponderacion;
				const ID = valores[campo_id];
				const atributoCalif = atributosCalific[campo].find((n) => n.id == ID);
				const valor = atributoCalif.valor;
				resultado += (valor * ponderacion) / 100;
			}
			valores.resultado = Math.round(resultado);

			// Averigua si existe la calificacion
			const existe = await BD_genericas.obtienePorCondicion("cal_registros", condics);
			existe
				? await BD_genericas.actualizaPorId("cal_registros", existe.id, valores)
				: await BD_genericas.agregaRegistro("cal_registros", valores);

			// Actualiza las calificaciones del producto
			await procesos.actualizaCalifProd({entidad, entidad_id});

			// Fin
			return res.redirect(req.originalUrl);
		},
	},
};
