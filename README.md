# Studio Smit

Studio Smit es una landing estatica mobile-first para un estudio de tatuajes. Tambien funciona como implementacion demo de una plantilla reutilizable para negocios que trabajan con turnos: barberias, estudios de unas, nutricionistas, entrenadores, consultorios, fotografos, centros de estetica y servicios profesionales.

El proyecto usa solo HTML, CSS y JavaScript vanilla. No usa frameworks, build tools, backend ni dependencias externas, por lo que queda listo para GitHub Pages.

## Estructura

```text
studio-smit/
|-- index.html
|-- README.md
|-- data/
|   `-- site.json
`-- assets/
    |-- css/
    |   `-- styles.css
    |-- js/
    |   `-- app.js
    `-- img/
        |-- hero.svg
        |-- tattoo-01.svg
        |-- tattoo-02.svg
        |-- tattoo-03.svg
        |-- tattoo-04.svg
        |-- tattoo-05.svg
        `-- tattoo-06.svg
```

## Editar datos

Toda la informacion visible sale desde `data/site.json`.

Desde ese archivo podes cambiar:

- `seo`: titulo del navegador y meta description.
- `business`: nombre, rubro, subtitulo, descripcion e imagen principal.
- `theme`: paleta visual activa.
- `sections`: secciones activas o desactivadas.
- `ui`: textos de navegacion, botones, labels y mensajes.
- `booking`: turnero demo y modo de reserva.
- `promotions`: promociones.
- `gallery`: trabajos realizados.
- `contact`: links de WhatsApp, Instagram, email, telefono y ubicacion.
- `footer`: texto final.

## Cambiar paleta

En `data/site.json`, cambia:

```json
"theme": {
  "selectedPalette": "inkYellow"
}
```

Paletas disponibles:

- `inkYellow`: negro y amarillo, ideal para tatuajes, barberias y marcas urbanas.
- `warmBarber`: verde oscuro, crema y dorado, ideal para barberias, cafes y tiendas artesanales.
- `softBeauty`: rosa suave y fondo claro, ideal para unas, estetica, maquillaje y spa.
- `activeBlue`: azul oscuro y naranja, ideal para gimnasio, fitness y nutricion deportiva.
- `clinicCalm`: verde agua y fondo claro, ideal para salud, consultorios y nutricionistas.
- `minimalMono`: blanco, negro y grises, ideal para fotografos, portfolios y marcas sobrias.

La plantilla tambien mantiene compatibilidad con el formato viejo de `theme` usando colores sueltos como `primaryColor`, `backgroundColor`, etc.

## Activar o desactivar secciones

En `data/site.json`:

```json
"sections": {
  "booking": true,
  "promotions": true,
  "gallery": true,
  "contact": true
}
```

Si `promotions` o `gallery` estan vacios, la seccion no se renderiza. El link del menu tambien desaparece automaticamente.

## Modos de reserva

El turnero actual es demo/ficticio. En `booking.mode` podes usar:

- `whatsapp`: el usuario elige un horario y el boton abre WhatsApp con un mensaje armado.
- `calendar`: el boton abre `booking.calendarUrl`, por ejemplo Google Calendar Appointment Schedule.
- `external`: el boton abre `booking.externalUrl`, util para Google Forms, Calendly, TidyCal u otra agenda externa.

Ejemplo:

```json
"booking": {
  "enabled": true,
  "mode": "whatsapp",
  "whatsappMessage": "Hola, quiero consultar por un turno en {businessName} para el {date} a las {time}."
}
```

Para produccion se puede usar WhatsApp, Google Calendar Appointment Schedule, Google Forms, Calendly, TidyCal o un backend propio.

## Cambiar imagenes

Las imagenes actuales son SVG placeholders en `assets/img/`.

Para usar imagenes reales:

1. Subi tus archivos a `assets/img/`.
2. Cambia las rutas en `data/site.json`.
3. Usa nombres simples, por ejemplo `trabajo-01.jpg`, `hero.webp` o `servicio-01.png`.

## Probar localmente

Como el sitio usa `fetch()` para leer `data/site.json`, abrilo con un servidor local.

Desde la carpeta `studio-smit`:

```bash
python -m http.server 8000
```

Luego entra a:

```text
http://localhost:8000/
```

## Publicar en GitHub Pages

1. Subi el proyecto a un repositorio de GitHub.
2. Entra a `Settings` > `Pages`.
3. En `Build and deployment`, elegi `Deploy from a branch`.
4. Selecciona la rama principal y la carpeta donde esta `index.html`.
5. Guarda los cambios y espera la URL publica.

No hay dependencias obligatorias, asi que GitHub Pages puede servir el sitio directamente.
