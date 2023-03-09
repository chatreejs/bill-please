FROM node:14-alpine AS build

ARG BASE_HREF=/

WORKDIR /app
COPY package.json ./package.json
RUN npm install

COPY . /app
RUN npm run ng -- build --configuration production --base-href $BASE_HREF

FROM nginxinc/nginx-unprivileged:1.23-alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ClientApp /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
