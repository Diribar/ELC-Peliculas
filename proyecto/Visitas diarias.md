Visitas diarias
- Códigos de visita_id
	- Con usuario: u0...0 (u + 10 dígitos, donde va el id) 
	- Sin usuario: v0...0 (v + 10 dígitos, donde va un n° al azar) 

- Al navegar el sitio, se obtiene la visita para actualizarla con el cambio de fecha
	- del cookie 
	- si no existe el cookie, crea una

- En loginsDelDia,
	- Las personas se cuentan una sola vez por día, priorizando con logín
	- La visita_id se guarda siempre, para comparar y priorizar los "con usuario"

- En loginsAcum,
	- Se cuenta en usuario o visita, en forma excluyente
