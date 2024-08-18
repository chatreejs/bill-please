FROM node:18-alpine AS builder

ARG BUILD_CONFIGURATION

WORKDIR /app
COPY package.json yarn.lock ./

RUN yarn
COPY ./ /app/
RUN yarn build:$BUILD_CONFIGURATION

FROM nginxinc/nginx-unprivileged:1.23-alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build/ /usr/share/nginx/html

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
