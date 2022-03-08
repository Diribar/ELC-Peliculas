window.addEventListener("load", () => {
	// Variables
	let filas_yaExistentes = document.querySelectorAll(".yaExistentes");
	let botonesEditar = document.querySelectorAll(".yaExistentes .fa-pen");
	let fila_dataEntry = document.querySelectorAll("#dataEntry");
	let tr = [];

	// Listener de 'edición'
	for (let i = 0; i < botonesEditar.length; i++) {
		botonesEditar[i].addEventListener("click", () => {
			// Crea la nueva 'tr'
			// 1. Logo del proveedor + 'id' del link
			// let td_url = filas_yaExistentes[i].children[0];
			// 2. Resto de los campos
			for (let j = 1; j < 6; j++) {
				filas_yaExistentes[i].children[j]=fila_dataEntry[0].children[j];
				// tr[j] = fila_dataEntry[0].children[j];
				// console.log(tr[j]);
			}

			// console.log(fila_dataEntry[0].children);
			// console.log(filas_yaExistentes[i].children);
			// <td class="logoProv" title="<%= link.url %>">
			// 	<a href="//<%= link.url %>" target="_blank">
			// 		<img src="/imagenes/0-Logos/<%= link.link_prov.avatar %>" alt="<%= link.link_prov.nombre %>">
			// 	</a>
			// </td>
			// <!-- Calidad -->
			// <td><%= link.calidad %></td>
			// <!-- Tipo -->
			// <td><%= link.link_tipo.nombre %></td>
			// <!-- Completo -->
			// <td><%- link.completo ? "SI" : "NO" %></td>
			// <!-- Parte -->
			// <td class="<%- link.completo ? 'desperdicio' : '' %>">
			// 	<%- !link.completo ? link.parte : '' %>
			// </td>
			// <!-- Gratuito -->
			// <td><%= link.gratuito ? "SI" :  "NO" %></td>
			// <!-- Status -->
			// <td><%= link.status_registro.links %> </td>
			// <!-- Acción -->
			// <td>
			// 	<i class="fa-solid fa-pen" title="Editar"></i>
			// 	<i class="fa-solid fa-trash-can" title='Inactivar'></i>
			// </td>

			// 2. Reemplaza la 'tr'
		});
	}
});
// botón input 'submit'
