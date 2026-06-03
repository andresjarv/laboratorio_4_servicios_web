Markdown
# Taller 4: Sistema de Reservas Institucional

Este proyecto es una aplicación Full-Stack containerizada diseñada para la gestión de espacios y reservas. La arquitectura implementa un backend robusto en Python, un frontend interactivo y una base de datos relacional, todo orquestado mediante Docker Compose para garantizar consistencia entre los entornos de desarrollo y producción.

---

## 🏗️ Arquitectura del Sistema

El proyecto utiliza una arquitectura de tres capas implementada a través de contenedores aislados:

1. **Frontend (Nginx + React/Vite):** - Utiliza un *multi-stage build*. Node.js se encarga de compilar los recursos estáticos, los cuales son servidos por un servidor web Nginx ultraligero (`alpine`).
   - Nginx está configurado como un **Proxy Reverso**. Atrapa todas las peticiones a la ruta `/api/` y las redirige internamente al backend, solucionando problemas de CORS y ocultando los puertos internos al usuario final.
2. **Backend (FastAPI - Python):**
   - API RESTful de alto rendimiento que maneja la lógica de negocio, autenticación JWT (con encriptación bcrypt) y validación de datos a través de esquemas de Pydantic.
3. **Base de Datos (PostgreSQL):**
   - Base de datos relacional persistente mediante volúmenes de Docker, estructurada a través de SQLAlchemy (ORM).

---

## 🌿 Estrategia de Ramas (Git Flow)

Para mantener la integridad del código y facilitar el trabajo colaborativo, implementamos la siguiente estructura de control de versiones:

* **`dev` (Desarrollo):** Rama de integración de código puro. Aquí residen los controladores, modelos, componentes de React y lógica de negocio.
* **`ops` (Operaciones/DevOps):** Rama dedicada a la infraestructura. Contiene los `Dockerfiles` separados para cada ecosistema, configuraciones de Nginx y el orquestador `docker-compose.yml`.
* **`main` (Producción):** Rama final de despliegue. Contiene la versión estable, testeada y completamente funcional, resultado de la fusión entre el código de `dev` y la infraestructura de `ops`.

---

## 🚀 Instrucciones de Despliegue

### Requisitos Previos
* Docker y Docker Compose instalados en el sistema.
* Git para la clonación del repositorio.
* Puertos `80` (HTTP), `8000` (API) y `5432` (BD) libres en la máquina host.

### Pasos para Ejecución

1. **Clonar el repositorio y ubicarse en la rama principal:**
   ```bash
   git clone https://github.com/andresjarv/laboratorio_4_servicios_web.git
   cd laboratorio_4_servicios_web
   git checkout main

2. **Levantar la infraestructura (Build & Run):**
   ```bash
   docker compose up -d --build

3. **Acceso al Sistema:**
* Interfaz Gráfica (Frontend): http://localhost
* Documentación de la API (Swagger): http://localhost:8000/docs

**Equipo de Desarrollo:**
* Julian David Velez Arango - Desarrollo Frontend (React/Vite).

* Diego Alejandro Giraldo Bolivar  - Desarrollo Frontend / UI.

* Jorge Andrés Vidal Ramírez - Desarrollo Backend (FastAPI), Base de Datos y Arquitectura DevOps (Docker/Nginx).

Desarrollado para la Institución Universitaria ITM.
