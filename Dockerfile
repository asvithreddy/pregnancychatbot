# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Install ngrok globally for tunnel support
RUN npm install -g @expo/ngrok

# Copy the rest of the app
COPY . .

# Expose Expo default port
EXPOSE 8081 19000 19001 19002

# Start Expo in LAN mode (so devices on the network can access it)
CMD ["npx", "expo", "start", "--tunnel"]