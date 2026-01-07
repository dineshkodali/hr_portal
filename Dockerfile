# Stage 1: Build React frontend
FROM node:18 AS build

WORKDIR /app

# Copy package.json files
COPY package*.json ./

# Install dependencies (devDependencies included)
RUN npm install

# Copy source code
COPY . .

# Build the React app (creates /app/dist)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
