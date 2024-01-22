# Step 1: Use a Node.js image
FROM node:20.11.0-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's source code from your host to your image filesystem.
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
# Here we will use npm run start
CMD ["npm", "run", "start"]
