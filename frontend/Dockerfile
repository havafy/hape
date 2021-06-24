
FROM node:13.10.1-alpine3.11

RUN apk update && apk add bash
RUN npm config set unsafe-perm true
# Setup app working directory
WORKDIR /src
# Copy sourcecode
COPY . /src
CMD rm -rf .next && npm i && npm run build && npm run start