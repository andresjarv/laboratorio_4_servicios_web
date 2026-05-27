Markdown
# 🚀 Documentación de Despliegue (Rama Ops)

Este documento detalla la infraestructura y el proceso de despliegue de la API de Reservas Institucionales utilizando contenedores Docker.

## A. Requisitos Previos
Para ejecutar este proyecto en un entorno local, asegúrese de contar con:
* **Docker Desktop** (con WSL 2 habilitado si se encuentra en Windows).
* **Git** para la clonación del repositorio.
* Puertos libres: `8000` (FastAPI) y `5432` (PostgreSQL).

## B. Configuración Inicial y Variables de Entorno
Antes de levantar los contenedores, es necesario configurar las variables de entorno. 

### 1. Clone el repositorio y sitúese en la raíz del proyecto:
   `Bash
   git clone https://github.com/andresjarv/laboratorio_4_servicios_web.git
   cd laboratorio_4_servicios_web

### 2. Diríjase a la carpeta del backend y duplique el archivo de ejemplo:
    
    cp backend/.env.example backend/.env`

Edite el archivo backend/.env con credenciales seguras. Este archivo es ignorado por Git por motivos de seguridad. Las variables requeridas son:

**DATABASE_URL:** Cadena de conexión a la base de datos PostgreSQL.

**SECRET_KEY:** Clave alfanumérica para el cifrado y firma de los tokens JWT.

### 3. Arquitectura de Contenedores y Red
El despliegue está orquestado mediante docker-compose.yml, el cual levanta y conecta los siguientes servicios en una red interna privada:

* **Contenedor** postgres_db **(Base de Datos)**:

    * **Imagen:** postgres:15-alpine (Versión ligera).

    * **Puerto expuesto:** 5432

    * **Persistencia:** Se configuró un volumen de Docker (pgdata) mapeado al directorio interno de PostgreSQL. Esto garantiza que las tablas, los usuarios y las reservas no se eliminen cuando el contenedor se apaga o reinicia.

* **Contenedor backend (API Rest):**

    * **Construcción:** A partir de un Dockerfile propio utilizando la imagen oficial python:3.10-slim.

    * **Puerto expuesto:** 8000

    * **Dependencia:** Condicionado mediante depends_on para iniciar únicamente cuando el motor de base de datos esté activo.

### 4. Instrucciones de Ejecución
Para construir las imágenes y levantar todo el sistema en segundo plano, ejecute el siguiente comando desde la raíz del proyecto (donde se encuentra el docker-compose.yml):

Bash
    docker compose up -d --build
Una vez finalizado el proceso, puede verificar el correcto funcionamiento accediendo a la documentación interactiva (Swagger) de la API en su navegador:
🔗 http://localhost:8000/docs

### 5. Gestión de los Contenedores (Apagado y Reinicio)
* Para apagar el sistema (sin borrar los datos guardados en el volumen):

Bash
    docker compose stop
* Para destruir los contenedores y liberar la red (preservando el volumen de datos):

Bash
    docker compose down    
* Para un reinicio duro borrando la base de datos (CUIDADO: Elimina toda la persistencia):

Bash
    docker compose down -v