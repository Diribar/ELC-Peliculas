Error DS
    - Post:
Detalle
- Ícono a la derecha:
    - Se fija que el status del producto esté alineado a 'statusErrores'
        - Inactivar/Recuperar: en ese campo de 'statusErrores'
        - else, no en statusErrores
    - Luego,
        - Si hay errores, ícono error (sólo revisores)
        - else,
            - inactivar o recuperar, ícono revisión (sólo revisores)
            - else, ícono historial
- Datos Breves:
    - Status: el del historial
    - Motivo:
        - sólo si está inactivo, el del historial
        - Se muestra el motivo, salvo para duplicado y otro, en los que se muestra el comentario

Historial
    - Sólo el historial
    - Ícono cambio de motivo (sólo si está en status inactivo, el del historial)

Recuperar
- Post: toma el motivo del movimiento anterior

Revisión de Inactivar
- Form: toma el comentario del movimiento anterior
- Post: toma el motivo del movimiento anterior

Revisión de Recuperar
- Post: toma el motivo del movimiento anterior
