# Proyecto Horas Key - Sistema de Gestión de Servicio Social

## Descripción del Proyecto

Proyecto Horas Key es una aplicación web para la gestión y seguimiento de horas de servicio social de estudiantes del Instituto Kriete de Ingeniería y Ciencias. El sistema permite a los estudiantes registrar sus horas, gestionar proyectos, y realizar un seguimiento de su progreso en el servicio social.

## Tecnologías Utilizadas

- HTML5 - Estructura semántica
- CSS3 - Estilos avanzados con CSS Grid y Flexbox
- JavaScript (ES6+) - Funcionalidad interactiva
- Chart.js - Gráficos y visualizaciones
- Font Awesome - Iconografía

## Requisitos del Sistema

- Navegador web moderno (Chrome, Firefox, Safari, Edge)

## Instalación

### Clonar el Repositorio

```bash
git clone https://github.com/arliebolanoss27/Proyecto-Horas-Key.git
cd Proyecto-Horas-Key
```

## Ejecución del Proyecto

### Frontend

**Opción 1 (Método más fácil):**
1. Navegar a la carpeta del proyecto
2. Hacer doble clic en `log.html` para iniciar
3. Usar las credenciales de prueba:
   - Email: `estudiante@keyinstitute.edu.sv`
   - Contraseña: `password`
4. El login te llevará automáticamente al dashboard

**Opción 2 (Con servidor local):**
1. Abrir terminal en la carpeta del proyecto
2. Ejecutar: `python -m http.server 8000`
3. Abrir navegador en: `http://localhost:8000/log.html`
4. Usar las credenciales de prueba para acceder

### Backend

1. Abrir terminal en la carpeta `backend`
2. Instalar dependencias: `npm install`
3. Ejecutar servidor: `npm run dev`
4. El backend estará disponible en: `http://localhost:3000`
5. Probar API en: `http://localhost:3000/api`

## Testing

### Probar Frontend
1. Abrir `log.html` en el navegador
2. Ingresar credenciales: `estudiante@keyinstitute.edu.sv` / `password`
3. Verificar que redirige al dashboard
4. Probar la navegación entre secciones
5. Verificar que el modo oscuro funciona
6. Probar el cambio de idioma

### Probar Backend
1. Ejecutar el servidor backend: `npm run dev`
2. Abrir navegador en: `http://localhost:3000`
3. Verificar que muestra mensaje de API funcionando
4. Probar endpoint de login: `POST http://localhost:3000/api/auth/login`
5. Verificar logs del servidor

## Estado Actual

- Sistema de login funcional con credenciales de prueba
- Frontend completo con dashboard interactivo
- Backend API REST con Node.js y Express
- Diseño responsive y moderno
- Modo oscuro implementado
- Soporte multiidioma (ES/EN)
- Navegación completa entre login y dashboard

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

---

IMPORTANTE PARA CHECKPOINT 2: Este README proporciona las instrucciones completas para ejecutar tanto el frontend como el backend. Ambos están completamente funcionales y pueden ejecutarse siguiendo las instrucciones proporcionadas.