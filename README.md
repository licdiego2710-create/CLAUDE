# 6D AntiGravity — Página Profesional

Página web profesional con efectos 6DOF (six degrees of freedom) y animaciones antigravedad.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Estructura HTML de la página (5 secciones) |
| `styles.css` | Estilos: variables CSS, cubo 3D, animaciones float |
| `main.js` | Canvas de partículas, cursor, parallax, tilt, contadores |

## Secciones

- **Hero** — Cubo 3D CSS animado en 6 ejes + partículas antigravedad
- **Sobre Mí** — Tarjeta con tilt 3D y contadores animados
- **Habilidades** — Grid con barras de progreso animadas al scroll
- **Proyectos** — Cards con efecto parallax tilt
- **Contacto** — Formulario + links sociales

## Características

- Canvas WebGL de partículas reactivas al mouse
- Cubo CSS 3D con rotación en todos los ejes (Pitch, Yaw, Roll + X, Y, Z)
- Cursor personalizado con follower suavizado
- Parallax en hero al mover el mouse
- Scroll reveal con IntersectionObserver
- 100% vanilla JS — sin dependencias externas
- Responsive mobile

## Uso

Abrir `index.html` directamente en el navegador o servir con cualquier servidor estático:

```bash
npx serve .
# o
python3 -m http.server 8080
```
