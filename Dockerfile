# Use the official Node.js image as base
FROM node:22.14.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Install 'dotenv' to ensure .env variables are loaded
RUN npm install dotenv

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "src/server.js"]
