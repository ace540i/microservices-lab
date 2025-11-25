# ---------- Stage 1: Build ----------
FROM node:20 AS build

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# ---------- Stage 2: Runtime ----------
FROM node:20-slim AS runtime

WORKDIR /app

# Copy only production dependencies from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy app source
COPY --from=build /app/index.js ./index.js
COPY --from=build /app/package*.json ./

# Expose service port
EXPOSE 4000

# Run the service
CMD ["node", "index.js"]
