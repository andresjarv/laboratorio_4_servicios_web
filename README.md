# Documentación Técnica (dev)

## BACKEND: 

### El Motor de la Base de Datos (app/db.py)

Este archivo es el corazón de la conexión. Se encargará de leer el archivo .env y establecer el puente con PostgreSQL usando SQLAlchemy.

*   La función get_db() es crucial. Es un generador que abre una conexión a la base de datos cada vez que alguien hace una petición a tu API (ej. 
    crear una reserva), y la cierra automáticamente al terminar, evitando que el servidor colapse por conexiones abiertas.

**Las Dependencias del Proyecto (requirements.txt)**
    fastapi y uvicorn levantan el servidor web. sqlalchemy y psycopg2-binary son para conectarnos a PostgreSQL. python-jose y passlib manejan la seguridad de contraseñas y los tokens JWT (obligatorio en la rúbrica). python-multipart permite recibir formularios (necesario para el login). pydantic-settings leerá nuestro archivo .env.

### La Capa API (app/api/)

    Esta carpeta contiene los Routers. Su única responsabilidad es definir las URLs (ej. /usuarios/), los métodos HTTP (GET, POST) y qué esquema de datos entra y sale.

* **[app/api/auth.py](app/api/auth.py)**
    Maneja el inicio de sesión. Recibe un usuario y contraseña mediante OAuth2PasswordRequestForm, verifica en la base de datos (que programaremos luego) y, si todo es correcto, emite y devuelve el Token JWT.

* **app/api/usuarios.py**
    Expone las rutas para crear un usuario nuevo y para listar los existentes. Fíjate en la inyección de get_current_user; esto asegura que el endpoint /usuarios/ esté protegido por JWT.

* **app/api/espacios.py**
    Permite al administrador crear espacios físicos en la base de datos y a los usuarios listar aquellos que no estén inactivos o en mantenimiento.

* **app/api/reservas.py**
    El corazón del sistema. Define la creación de reservas (donde luego implementaremos las validaciones complejas de tiempo), la consulta, y la ruta para que el administrador apruebe o rechace (PUT /reservas/{id}/estado).

### La Capa de Modelos (app/models/)

    Aquí transformamos los cuadros conceptuales en el código real, aplicando reglas estrictas.

*   **app/models/usuario.py**
    Implementamos RolUsuario como un Enum. Si alguien intenta guardar un rol "Administrador" o "Adminstrador" (con error ortográfico), PostgreSQL lo rechazará de inmediato. Agregamos password_hash para cumplir con la regla de seguridad.

*   **app/models/espacio.py**
    Igual que con el usuario, blindamos la columna estado para que solo acepte los tres estados permitidos por la regla de negocio G.  

*   **app/models/reserva.py**
    Definimos las llaves foráneas (ForeignKey) que conectan esta tabla con Usuarios y Espacios. Además, asignamos por defecto el estado esperando, cumpliendo automáticamente con la regla I sin tener que programarlo en los controladores.

