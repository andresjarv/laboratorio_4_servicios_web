# Documentación Técnica (dev)

## BACKEND: 

### La Capa API (app/api/)
    Esta carpeta contiene los Routers. Su única responsabilidad es definir las URLs (ej. /usuarios/), los métodos HTTP (GET, POST) y qué esquema de datos entra y sale.

* **requirements.txt:**
    fastapi y uvicorn levantan el servidor web. sqlalchemy y psycopg2-binary son para conectarnos a PostgreSQL. python-jose y passlib manejan la seguridad de contraseñas y los tokens JWT (obligatorio en la rúbrica). python-multipart permite recibir formularios (necesario para el login). pydantic-settings leerá nuestro archivo .env.

* **auth.py:** 
    Maneja el inicio de sesión. Recibe un usuario y contraseña mediante OAuth2PasswordRequestForm, verifica en la base de datos (que programaremos luego) y, si todo es correcto, emite y devuelve el Token JWT.

* **usuarios.py:**
    Expone las rutas para crear un usuario nuevo y para listar los existentes. Fíjate en la inyección de get_current_user; esto asegura que el endpoint /usuarios/ esté protegido por JWT.

* **espacios.py:**
    Permite al administrador crear espacios físicos en la base de datos y a los usuarios listar aquellos que no estén inactivos o en mantenimiento.

* **reservas.py:**
    El corazón del sistema. Define la creación de reservas (donde luego implementaremos las validaciones complejas de tiempo), la consulta, y la ruta para que el administrador apruebe o rechace (PUT /reservas/{id}/estado).