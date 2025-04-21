# Backend Dockerfile
FROM node:20

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

RUN npx prisma generate

# Expose the backend port (optional)
EXPOSE 5001

COPY <<EOF /app/startup.sh
#!/bin/sh

npx prisma migrate deploy


npx prisma migrate dev --name init


# Deploy schema
echo "Deploying Prisma schema..."
# npx prisma migrate dev

# Optional: Seed the database if needed
# npx prisma db seed

# Start the application
echo "Starting server..."
node server.js
EOF

RUN chmod +x /app/startup.sh

# Start the server using the startup script
CMD ["/app/startup.sh"]
