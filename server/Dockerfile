FROM node:20-bullseye-slim

WORKDIR /usr/src/app

# Copia los archivos de dependencias desde la carpeta 'server'
COPY server/package*.json ./

# Instala solo las dependencias de producción para una imagen más ligera
RUN npm install --omit=dev

# Copia el resto del código de la aplicación desde la carpeta 'server'
COPY server/ .

CMD ["npm", "run", "dockerStart"]