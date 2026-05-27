# backend/Dockerfile

# 1. Usar una imagen oficial de Python ligera
FROM python:3.10-slim

# 2. Definir la carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar primero el archivo de dependencias (optimiza el caché de Docker)
COPY requirements.txt .

# 4. Instalar las librerías necesarias
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copiar todo el código de tu carpeta backend al contenedor
COPY . .

# 6. Exponer el puerto por el que escuchará FastAPI
EXPOSE 8000

# 7. El comando para encender el servidor cuando el contenedor inicie
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]