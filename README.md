# Documentación Técnica (dev)

# BACKEND: 
___

### El Motor de la Base de Datos [(app/db.py)](backend/app/db.py)
Este archivo es el corazón de la conexión. Se encargará de leer el archivo .env y establecer el puente con PostgreSQL usando SQLAlchemy.

*   La función get_db() es crucial. Es un generador que abre una conexión a la base de datos cada vez que alguien hace una petición a tu API (ej. 
    crear una reserva), y la cierra automáticamente al terminar, evitando que el servidor colapse por conexiones abiertas.

**Las Dependencias del Proyecto [requirements.txt:](backend/requirements.txt)** 
    fastapi y uvicorn levantan el servidor web. sqlalchemy y psycopg2-binary son para conectarnos a PostgreSQL. python-jose y passlib manejan la seguridad de contraseñas y los tokens JWT (obligatorio en la rúbrica). python-multipart permite recibir formularios (necesario para el login). pydantic-settings leerá nuestro archivo .env.

### 1. La Capa API [(app/api)](backend/app/api/)
Esta carpeta contiene los Routers. Su única responsabilidad es definir las URLs (ej. /usuarios/), los métodos HTTP (GET, POST) y qué esquema de datos entra y sale.

* **[app/api/auth.py:](backend/app/api/auth.py)** Maneja el inicio de sesión. Recibe un usuario y contraseña mediante OAuth2PasswordRequestForm, verifica en la base de datos (que programaremos luego) y, si todo es correcto, emite y devuelve el Token JWT.

* **[app/api/usuarios.py:](backend/app/api/usuarios.py)** Expone las rutas para crear un usuario nuevo y para listar los existentes. Fíjate en la inyección de get_current_user; esto asegura que el endpoint /usuarios/ esté protegido por JWT.

* **[app/api/espacios.py:](backend/app/api/espacios.py)** Permite al administrador crear espacios físicos en la base de datos y a los usuarios listar aquellos que no estén inactivos o en mantenimiento.

* **[app/api/reservas.py:](backend/app/api/reservas.py)** El corazón del sistema. Define la creación de reservas (donde luego implementaremos las validaciones complejas de tiempo), la consulta, y la ruta para que el administrador apruebe o rechace (PUT /reservas/{id}/estado).

### 2. La Capa de Modelos [(app/models)](backend/app/models/)
Aquí transformamos los cuadros conceptuales en el código real, aplicando reglas estrictas.

*   **[app/models/usuario.py:](backend/app/models/usuario.py)** Implementamos RolUsuario como un Enum. Si alguien intenta guardar un rol "Administrador" o  "Adminstrador" (con error ortográfico), PostgreSQL lo rechazará de inmediato. Agregamos password_hash para cumplir con la regla de seguridad.

*   **[app/models/espacio.py:](backend/app/models/espacio.py)** Igual que con el usuario, blindamos la columna estado para que solo acepte los tres estados permitidos por la regla de negocio G.  

*   **[app/models/reserva.py:](backend/app/models/reserva.py)** Definimos las llaves foráneas (ForeignKey) que conectan esta tabla con Usuarios y Espacios. Además, asignamos por defecto el estado esperando, cumpliendo automáticamente con la regla I sin tener que programarlo en los controladores.

### 3. Capa de Esquemas [(app/schemas)](backend/app/schemas/)
Esta capa actúa como el escudo protector de la API. Define qué datos pueden ingresar (Requests) y qué datos pueden salir (Responses), filtrando información sensible como las contraseñas y validando formatos antes de tocar la base de datos.  

* **[app/schemas/usuario.py:](backend/app/schemas/usuario.py)** Separa la creación del usuario (donde se exige la contraseña plana) del modelo de respuesta (donde se omite por seguridad). Valida automáticamente que el correo tenga un formato válido mediante EmailStr.  

* **[app/schemas/espacio.py:](backend/app/schemas/espacio.py)** Define la entrada de datos para la creación de espacios y la salida que incluye el ID generado y el estado.

* **[app/schemas/reserva.py:](backend/app/schemas/reserva.py)** Maneja los datos de fechas y horas. Incluye la clase ReservaUpdate que aísla la actualización del estado (para aprobaciones o rechazos de administradores) evitando que modifiquen otros campos por error.

### 4. Capa Core [(app/core)](backend/app/core/)
Centraliza la lógica de seguridad y la lectura de variables de entorno, aislando estos procesos del resto del código para mantenerlo limpio y escalable.

* **[app/core/config:](backend/app/core/config.py)** Carga la configuración del token JWT (SECRET_KEY y tiempo de expiración) de forma segura.

* **[app/core/security:](backend/app/core/security.py)** Implementa passlib con el algoritmo bcrypt para el cifrado y verificación de contraseñas. También contiene la lógica generadora de tokens JWT mediante python-jose.

### 5. Capa de Lógica de Negocio [(app/crud)](backend/app/crud/)
Esta capa es el núcleo funcional del proyecto. Actúa como intermediario entre los controladores de la API y la base de datos, garantizando que ninguna acción viole las restricciones institucionales antes de hacer un commit.

* **[app/crud/crud_usuario.py:](backend/app/crud/crud_usuario.py)** Protege la integridad de la autenticación cifrando las contraseñas antes de insertarlas en PostgreSQL y validando que no existan correos duplicados.

* **[app/crud/crud_espacio.py:](backend/app/crud/crud_espacio.py)** Gestiona el ciclo de vida de los espacios institucionales, filtrando automáticamente en las consultas aquellos recintos que se encuentren inactivos o en mantenimiento.

* **[app/crud/crud_reserva.py:](backend/app/crud/crud_reserva.py)** Central de Reglas de Negocio. Intercepta la creación de reservas para ejecutar las siguientes validaciones en cadena:

    1. Integridad temporal (hora_inicio < hora_fin).

    2. Anticipación mínima de 24 horas calculada contra el reloj del servidor.

    3. Restricción de horarios institucionales (L-V 7am-8pm, Sáb 8am-12pm, prohibición dominical).

    4. Auditoría de aforo cruzando los asistentes solicitados contra la capacidad máxima del espacio físico.

    5. Algoritmo de prevención de colisiones: Evita solapamientos temporales cruzando rangos de fechas contra reservas existentes cuyo estado no sea rechazada.

# FRONTEND
## Sistema de Gestión de Reservas Institucionales

---

## Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Tecnologías y Dependencias](#3-tecnologías-y-dependencias)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Módulos y Responsabilidades](#5-módulos-y-responsabilidades)
6. [Vistas y Rutas](#6-vistas-y-rutas)
7. [Funcionalidades por Rol](#7-funcionalidades-por-rol)
8. [Autenticación y Seguridad](#8-autenticación-y-seguridad)
9. [Comunicación con el Backend](#9-comunicación-con-el-backend)
10. [Gestión de Estado](#10-gestión-de-estado)
11. [Ramas del Repositorio](#11-ramas-del-repositorio)
12. [Entorno de Desarrollo — Rama dev](#12-entorno-de-desarrollo--rama-dev)
13. [Entorno de Producción — Rama ops](#13-entorno-de-producción--rama-ops)
14. [Variables de Entorno](#14-variables-de-entorno)
15. [Reglas de Negocio Aplicadas en el Frontend](#15-reglas-de-negocio-aplicadas-en-el-frontend)

---

## 1. Descripción General

ReservaHub es la interfaz web del sistema de reservas institucionales. Permite a los usuarios autenticados consultar espacios disponibles, solicitar reservas y hacer seguimiento a sus solicitudes. Los administradores disponen de funcionalidades adicionales para gestionar espacios, aprobar o rechazar reservas y administrar el listado de usuarios del sistema.

La aplicación es una **SPA (Single Page Application)** construida con React 18 y React Router DOM, lo que significa que toda la navegación ocurre en el cliente sin recargar la página. La comunicación con el servidor se realiza exclusivamente a través de la API REST del backend en FastAPI.

El diseño implementa un **tema oscuro** consistente, construido con CSS Variables nativas sin dependencia de librerías de estilos externas, lo que garantiza un bundle ligero y un control total sobre la apariencia visual.

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     NAVEGADOR                           │
│                                                         │
│   React SPA (puerto 80 en Docker / 5173 en desarrollo)  │
│                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│   │  Pages   │  │Components│  │ Context  │            │
│   └──────────┘  └──────────┘  └──────────┘            │
│         │              │            │                   │
│         └──────────────┴────────────┘                   │
│                        │                                │
│                   src/api/*.js                          │
└────────────────────────┼────────────────────────────────┘
                         │ HTTP / JSON
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  NGINX (solo en Docker)                  │
│                                                         │
│   /api/*  ──proxy──►  http://backend:8000/*             │
│   /*      ──serve──►  /usr/share/nginx/html (React)     │
└────────────────────────┼────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│             BACKEND — FastAPI (puerto 8000)              │
│                                                         │
│   /login  /usuarios  /espacios  /reservas               │
└────────────────────────┼────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│           PostgreSQL (puerto 5432) — Docker             │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Tecnologías y Dependencias

### Dependencias de producción

| Paquete            | Versión  | Propósito                                      |
|--------------------|----------|------------------------------------------------|
| react              | ^18.2.0  | Librería principal de UI                       |
| react-dom          | ^18.2.0  | Renderizado en el navegador                    |
| react-router-dom   | ^6.22.0  | Enrutamiento del lado del cliente (SPA)        |

### Dependencias de desarrollo

| Paquete              | Versión  | Propósito                                    |
|----------------------|----------|----------------------------------------------|
| vite                 | ^5.1.0   | Bundler y servidor de desarrollo             |
| @vitejs/plugin-react | ^4.2.1   | Soporte JSX y Fast Refresh para Vite         |

### Infraestructura (rama ops)

| Herramienta | Propósito                                              |
|-------------|--------------------------------------------------------|
| Docker      | Contenedorización del frontend                         |
| Nginx       | Servidor de archivos estáticos y proxy reverso         |
| Node 20     | Entorno de build en la etapa de construcción de Docker |

---

## 4. Estructura del Proyecto

```
frontend/
│
├── Dockerfile               # Imagen Docker multietapa (build + serve)
├── nginx.conf               # Configuración del servidor Nginx
├── index.html               # HTML raíz — punto de montaje de React
├── package.json             # Dependencias y scripts del proyecto
├── vite.config.js           # Configuración de Vite y proxy de desarrollo
├── .env                     # Variables de entorno (no se versiona)
├── .gitignore
│
└── src/
    │
    ├── main.jsx             # Punto de entrada: monta React + proveedores globales
    ├── App.jsx              # Definición de rutas y guards de navegación
    │
    ├── api/                 # Capa de acceso a datos (comunicación con el backend)
    │   ├── client.js        # Cliente HTTP base con manejo de errores centralizado
    │   ├── auth.js          # Funciones de login, registro y decodificación JWT
    │   ├── espacios.js      # Llamadas a los endpoints de espacios
    │   ├── reservas.js      # Llamadas a los endpoints de reservas
    │   └── usuarios.js      # Llamadas a los endpoints de usuarios
    │
    ├── context/
    │   └── AuthContext.jsx  # Estado global de autenticación con React Context
    │
    ├── hooks/
    │   ├── useFetch.js      # Hook genérico para peticiones con estado de carga
    │   └── useToast.js      # Hook auxiliar para notificaciones
    │
    ├── components/          # Componentes reutilizables entre páginas
    │   ├── Layout.jsx       # Contenedor raíz: Navbar + Outlet + Toast
    │   ├── Navbar.jsx       # Barra de navegación superior
    │   ├── Modal.jsx        # Modal genérico con overlay y cierre al hacer clic fuera
    │   ├── Badge.jsx        # Indicadores visuales de estado (espacio, reserva, rol)
    │   └── Toast.jsx        # Sistema de notificaciones con contexto global
    │
    ├── pages/               # Vistas completas de la aplicación
    │   ├── LoginPage.jsx    # Inicio de sesión
    │   ├── RegisterPage.jsx # Registro de nuevo usuario
    │   ├── EspaciosPage.jsx # Consulta de espacios y creación (admin)
    │   ├── ReservasPage.jsx # Gestión de reservas y aprobación (admin)
    │   └── UsuariosPage.jsx # Listado de usuarios (solo admin)
    │
    └── styles/
        └── global.css       # Sistema de diseño: variables CSS, componentes base
```

---

## 5. Módulos y Responsabilidades

### src/api/client.js
Cliente HTTP centralizado que envuelve la API nativa `fetch`. Gestiona:
- Inyección automática del token JWT en cada petición autenticada
- Manejo unificado de errores HTTP (extrae el `detail` de FastAPI)
- Soporte para peticiones JSON y `multipart/form-data` (para el login con OAuth2)
- Selección de `BASE_URL` según el entorno (Docker o desarrollo local)

### src/api/auth.js
Funciones específicas para autenticación:
- `login(correo, password)` — envía las credenciales como `FormData` al endpoint `/login` (requerido por OAuth2PasswordRequestForm de FastAPI)
- `register(nombre, correo, password)` — crea un nuevo usuario sin autenticación
- `decodeToken(token)` — decodifica el payload del JWT en el cliente para leer el correo y rol (sin verificar firma, solo para UX)

### src/context/AuthContext.jsx
Provee el estado global de autenticación a toda la aplicación:
- Persiste el token en `localStorage` para mantener la sesión entre recargas
- Hidrata los datos completos del usuario consultando `/usuarios/` al inicio
- Expone `isAdmin` como booleano derivado del rol del usuario
- Maneja el ciclo completo: login → hidratación → logout

### src/hooks/useFetch.js
Hook genérico que encapsula el patrón `loading / data / error` para cualquier llamada a la API. Acepta una función `fetchFn` y un array de dependencias, retorna `{ data, loading, error, reload }`.

### src/components/Badge.jsx
Componentes de presentación para estados del sistema:
- `BadgeEspacio` — activo / inactivo / mantenimiento
- `BadgeReserva` — esperando / aprobada / rechazada
- `BadgeRol` — admin / usuario

### src/components/Toast.jsx
Sistema de notificaciones implementado con React Context. Permite disparar toasts desde cualquier componente de la aplicación sin necesidad de prop drilling. Las notificaciones desaparecen automáticamente a los 3.5 segundos.

### src/App.jsx
Define tres tipos de rutas:
- **PublicRoute** — redirige al dashboard si ya hay sesión activa
- **PrivateRoute** — redirige al login si no hay token
- **AdminRoute** — redirige al dashboard si el usuario no es administrador

---

## 6. Vistas y Rutas

| Ruta         | Componente       | Acceso          | Descripción                                              |
|--------------|------------------|-----------------|----------------------------------------------------------|
| `/login`     | LoginPage        | Público         | Formulario de inicio de sesión con JWT                   |
| `/register`  | RegisterPage     | Público         | Formulario de registro de nueva cuenta                   |
| `/espacios`  | EspaciosPage     | Autenticado     | Grid de espacios disponibles. Admin puede crear nuevos   |
| `/reservas`  | ReservasPage     | Autenticado     | Tabla de reservas. Admin ve todas y puede gestionarlas   |
| `/usuarios`  | UsuariosPage     | Solo Admin      | Tabla de todos los usuarios registrados en el sistema    |
| `/`          | —                | Autenticado     | Redirige automáticamente a `/espacios`                   |
| `/*`         | —                | —               | Cualquier ruta inválida redirige a `/espacios`           |

---

## 7. Funcionalidades por Rol

### Rol: usuario

**Autenticación**
- Registrar una nueva cuenta con nombre, correo y contraseña
- Iniciar sesión con correo y contraseña
- Cerrar sesión (elimina el token del almacenamiento local)

**Espacios**
- Visualizar todos los espacios con estado `activo` en un grid de tarjetas
- Consultar nombre, ubicación, capacidad y estado de cada espacio

**Reservas**
- Solicitar una reserva seleccionando espacio, fecha, hora de inicio, hora de fin y cantidad de asistentes
- Visualizar únicamente sus propias reservas con el estado actual de cada una

---

### Rol: admin

Incluye todas las funcionalidades del rol usuario, más:

**Espacios**
- Registrar nuevos espacios con nombre, ubicación y capacidad

**Reservas**
- Visualizar todas las reservas del sistema (de todos los usuarios)
- Aprobar reservas en estado `esperando`
- Rechazar reservas en estado `esperando`

**Usuarios**
- Visualizar el listado completo de usuarios registrados con su rol asignado

---

## 8. Autenticación y Seguridad

El sistema implementa autenticación basada en **JWT (JSON Web Token)** siguiendo el esquema OAuth2 con contraseña que expone el backend.

### Flujo de autenticación

```
1. Usuario ingresa correo y contraseña en LoginPage
2. El frontend envía POST /login con FormData (username + password)
3. El backend valida las credenciales y retorna { access_token, token_type }
4. El token se almacena en localStorage
5. AuthContext decodifica el payload del JWT para obtener el correo
6. Se consulta GET /usuarios/ para obtener el perfil completo del usuario
7. El usuario y token quedan disponibles globalmente via AuthContext
```

### Protección de rutas

Los guards de navegación en `App.jsx` verifican la presencia del token antes de renderizar cualquier página protegida. Si el token no existe o expira, el usuario es redirigido automáticamente al login.

### Envío del token

En cada petición autenticada, el cliente HTTP agrega el header:

```
Authorization: Bearer <token>
```

El backend valida este token en cada endpoint protegido mediante el esquema `OAuth2PasswordBearer`.

---

## 9. Comunicación con el Backend

Todos los endpoints consumidos por el frontend:

| Método | Endpoint                        | Autenticación | Descripción                          |
|--------|---------------------------------|---------------|--------------------------------------|
| POST   | /login                          | No            | Obtener token JWT                    |
| POST   | /usuarios/                      | No            | Registrar nuevo usuario              |
| GET    | /usuarios/                      | Sí            | Listar todos los usuarios (admin)    |
| GET    | /espacios/disponibles           | No            | Listar espacios activos              |
| POST   | /espacios/                      | Sí (admin)    | Crear nuevo espacio                  |
| GET    | /reservas/                      | Sí            | Listar reservas (propias o todas)    |
| POST   | /reservas/                      | Sí            | Solicitar nueva reserva              |
| PUT    | /reservas/{id}/estado           | Sí (admin)    | Aprobar o rechazar una reserva       |

---

## 10. Gestión de Estado

El frontend no utiliza librerías externas de manejo de estado (Redux, Zustand, etc.). El estado se gestiona con las herramientas nativas de React:

| Mecanismo         | Uso                                                              |
|-------------------|------------------------------------------------------------------|
| `useState`        | Estado local de formularios, modales y carga                     |
| `useEffect`       | Efectos secundarios: carga de datos al montar componentes        |
| `useContext`      | Estado global de autenticación a través de `AuthContext`         |
| `localStorage`    | Persistencia del token JWT y datos del usuario entre sesiones    |
| Hook `useFetch`   | Abstracción del patrón loading/data/error para llamadas a la API |

---

## 11. Ramas del Repositorio

El repositorio está organizado en dos ramas principales con responsabilidades diferenciadas:

### Rama `dev`
Contiene el código fuente de la aplicación. Es la rama de desarrollo activo donde se trabajan nuevas funcionalidades, correcciones y ajustes al frontend y backend.

Archivos propios de esta rama:
```
frontend/
├── src/                  # Todo el código fuente de React
├── index.html
├── package.json
├── vite.config.js
└── .env                  # Variables para desarrollo local
```

### Rama `ops`
Contiene toda la configuración de infraestructura y despliegue. No se desarrolla código de aplicación aquí — solo configuración de contenedores y orquestación de servicios.

Archivos propios de esta rama:
```
docker-compose.yml        # Orquestación de los tres servicios
frontend/
├── Dockerfile            # Imagen Docker del frontend (build + nginx)
└── nginx.conf            # Configuración del servidor y proxy reverso
backend/
└── Dockerfile            # Imagen Docker del backend (FastAPI + uvicorn)
```

Esta separación permite que el equipo de desarrollo trabaje en `dev` sin interferir con la configuración de producción, y que los cambios de infraestructura en `ops` se gestionen de forma independiente.

---

## 12. Entorno de Desarrollo — Rama dev

### Requisitos previos
- Node.js 20 o superior
- Backend de FastAPI corriendo en `http://localhost:8000`
- CORS habilitado en el backend

### CORS requerido en el backend

Para que el frontend en desarrollo pueda comunicarse con el backend, se debe agregar el middleware de CORS en `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Instalación y ejecución

```bash
# Desde la raíz del proyecto
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Comandos disponibles

| Comando         | Descripción                                              |
|-----------------|----------------------------------------------------------|
| `npm run dev`   | Inicia el servidor de desarrollo con Hot Module Reload   |
| `npm run build` | Compila el proyecto para producción en la carpeta `dist/`|
| `npm run preview` | Previsualiza el build de producción localmente         |

---

## 13. Entorno de Producción — Rama ops

El frontend se despliega como un contenedor Docker dentro de un stack orquestado con Docker Compose. El stack completo incluye tres servicios:

| Contenedor     | Imagen base     | Puerto | Descripción                        |
|----------------|-----------------|--------|------------------------------------|
| `web_reservas` | nginx:alpine    | 80     | Frontend React servido por Nginx   |
| `api_reservas` | python:3.11     | 8000   | Backend FastAPI                    |
| `db_reservas`  | postgres:15-alpine | 5432 | Base de datos PostgreSQL          |

### Proceso de build del frontend (Dockerfile multietapa)

```
Etapa 1 — Builder (node:20-alpine)
  └── COPY package.json
  └── RUN npm install
  └── COPY src/ index.html vite.config.js
  └── RUN npm run build  →  genera /app/dist/

Etapa 2 — Servidor (nginx:alpine)
  └── COPY /app/dist → /usr/share/nginx/html
  └── COPY nginx.conf → /etc/nginx/conf.d/default.conf
  └── EXPOSE 80
```

La etapa de build no se incluye en la imagen final, lo que resulta en una imagen de producción ligera basada únicamente en Nginx.

### Configuración de Nginx

Nginx cumple dos funciones en producción:

**1. Proxy reverso hacia el backend**
Las peticiones al path `/api/*` son redirigidas internamente al contenedor del backend sin que el navegador conozca la URL real del servidor:

```
GET http://localhost/api/reservas/
        ↓ Nginx proxy
GET http://backend:8000/reservas/
```

**2. Soporte para React Router (SPA fallback)**
Cualquier ruta que no corresponda a un archivo estático existente retorna `index.html`, permitiendo que React Router maneje la navegación del lado del cliente:

```
http://localhost/reservas  →  /usr/share/nginx/html/index.html
http://localhost/usuarios  →  /usr/share/nginx/html/index.html
```

### Levantar el stack completo

```bash
# Desde la raíz del proyecto (donde está el docker-compose.yml)
docker-compose up --build
```

El flag `--build` es necesario la primera vez o cuando hay cambios en el código. Para reinicios posteriores sin cambios:

```bash
docker-compose up
```

Para detener todos los servicios:

```bash
docker-compose down
```

Para detener y eliminar también los volúmenes (borra los datos de PostgreSQL):

```bash
docker-compose down -v
```

### URLs de acceso en producción

| Servicio   | URL                      |
|------------|--------------------------|
| Frontend   | http://localhost         |
| Backend    | http://localhost:8000    |
| PostgreSQL | localhost:5432           |

---

## 14. Variables de Entorno

### Frontend — archivo `.env` (rama dev)

```env
# URL base de la API del backend
# Solo se usa en desarrollo local
# En Docker, Nginx gestiona el proxy y esta variable no es necesaria
VITE_API_URL=http://localhost:8000
```

Las variables de entorno en Vite deben tener el prefijo `VITE_` para ser accesibles desde el código fuente. El archivo `.env` no debe versionarse.

### Lógica de selección de BASE_URL en client.js

```javascript
// Si existe VITE_API_URL (desarrollo local) → usa esa URL
// Si no existe (Docker) → usa '/api' y Nginx hace el proxy
const BASE_URL = import.meta.env.VITE_API_URL || '/api'
```

---

## 15. Reglas de Negocio Aplicadas en el Frontend

Además de las validaciones del backend, el frontend aplica las siguientes restricciones para mejorar la experiencia del usuario:

| Regla | Implementación                                                                 |
|-------|--------------------------------------------------------------------------------|
| Fecha mínima de reserva | El campo de fecha en el modal de reserva tiene un mínimo de pasado mañana (anticipa las 24h que valida el backend) |
| Cantidad de asistentes | El campo acepta solo valores enteros mayores a 0 (`min="1"`)                  |
| Acciones de admin ocultas | Los botones de aprobar/rechazar solo se renderizan si el usuario es admin y la reserva está en estado `esperando` |
| Botón de nuevo espacio | Solo visible para usuarios con rol `admin`                                     |
| Pestaña de usuarios | Solo aparece en la navegación si el usuario es `admin`                         |
| Redirección automática | Si el usuario ya tiene sesión activa, las rutas `/login` y `/register` redirigen al dashboard |
| Persistencia de sesión | El token se guarda en `localStorage`, por lo que la sesión se mantiene al recargar la página o cerrar el navegador |

