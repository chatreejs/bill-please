FROM node:18-alpine AS builder

ARG BUILD_CONFIGURATION
ARG GA_MEASUREMENT_ID

WORKDIR /app
COPY package.json yarn.lock ./

RUN yarn
COPY ./ /app/
RUN export VITE_APP_GA_MEASUREMENT_ID="$GA_MEASUREMENT_ID" && yarn build:"$BUILD_CONFIGURATION"

FROM nginxinc/nginx-unprivileged:1.23-alpine

COPY config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build/ /usr/share/nginx/html

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
