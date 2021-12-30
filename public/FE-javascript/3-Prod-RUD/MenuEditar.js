window.addEventListener("load", () => {
	// Definir variables
	let linkEditarProd = document.querySelector("#editarProducto");
	let API_EditarProd = "/producto/api/averiguar-si-esta-capturado/?entidad=";

	// Detectar si se le hace 'click'
	linkEditarProd.addEventListener("click", async (e) => {
		// Obtener los parámetros
		url = window.location.search;
		indice = url.indexOf("&id=");
		entidad = url.slice(9, indice);
		id = url.slice(indice + 4);
		// Obtener feedback del producto
		feedback = await fetch(API_EditarProd + entidad + "&id=" + id).then((n) => n.json());
		// Averiguar si el usuario está logueado, y en caso negativo redirigir a Login
		console.log(feedback);
		if (feedback=="hacerLogin") window.location.href ="/usuarios/login"
		// Acciones si se le hace 'click'
		// API con los datos de la entidad y el producto_id
		// true --> ir a Editar
		// false --> cartel de "Bloqueado"
		// Fin
	});
});
