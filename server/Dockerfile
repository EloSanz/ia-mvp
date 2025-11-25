FROM node:20-bullseye-slim

WORKDIR /usr/src/app

# Copy package files and install all dependencies to run build steps
COPY server/package*.json ./
RUN npm install

# Copy the rest of the application code from the 'server' directory
COPY server/ .

# Generate the Prisma client during the build
RUN npx prisma generate

# Remove devDependencies to keep the final image lean
RUN npm prune --omit=dev

# Set a production-ready default command.
# This will be overridden by the startup command in Azure App Service settings.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]