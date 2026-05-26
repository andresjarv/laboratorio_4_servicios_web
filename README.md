# Documentación Técnica (dev)

## BACKEND: 

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
