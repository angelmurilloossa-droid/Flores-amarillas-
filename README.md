# 🌻 Flores Amarillas — Experiencia interactiva

Una página web interactiva donde un cielo de estrellas termina formando un ramo de flores amarillas y muestra un nombre/mensaje personalizado.

## Estructura

```text
flores_amarillas/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── app.js
    └── config.js
```

## Cómo abrirla

1. Descomprime la carpeta.
2. Ábrela en Visual Studio Code.
3. Instala/usa Live Server si lo tienes.
4. Abre `index.html` con Live Server.

También puedes abrir `index.html` directamente en el navegador.

## Personalización

Todo lo básico está en:

`js/config.js`

Ejemplo:

```javascript
const CONFIG = {
  nombre: "Camila",
  mensaje: "Espero que hoy sonrías un poquito más.",
  cantidadEstrellas: 220,
  cantidadFlores: 9,
  duracionFormacion: 7000
};
```

La idea es que primero trabajemos esta versión y después podemos modificar:

- estilo de las flores
- forma del ramo
- movimiento de las estrellas
- textos
- colores
- música
- efectos de partículas
- pantalla inicial
- efectos para celular
- una carta/mensaje final
