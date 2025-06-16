# Step 1: Build frontend
FROM node:20 AS builder
WORKDIR /app
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Step 2: Setup backend + copy built frontend
FROM node:20
WORKDIR /app

# Copy backend and frontend build output
COPY backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Install backend dependencies
RUN cd backend && npm install

# Set working dir and start the server
WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "server.js"]
