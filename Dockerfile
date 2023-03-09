FROM node:14.21.3-alpine3.17 AS build

ARG BASE_HREF=/

WORKDIR /app
COPY package.json ./package.json
RUN npm install

COPY . /app
RUN npm run ng -- build --configuration production --base-href $BASE_HREF

FROM nginxinc/nginx-unprivileged:1.23-alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
