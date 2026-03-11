FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

ARG VITE_API_BASE=/api
ARG VITE_MAINTENANCE_MODE=false
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_MAINTENANCE_MODE=${VITE_MAINTENANCE_MODE}

RUN npm run build

FROM nginx:alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
