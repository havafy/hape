
FROM node:13.10.1-alpine3.11

RUN apk update && apk add bash
RUN npm config set unsafe-perm true
# Setup app working directory
WORKDIR /src
ARG MAX_OLD_SPACE_SIZE=8192
ENV NODE_OPTIONS=--max_old_space_size=$MAX_OLD_SPACE_SIZE
# Copy sourcecode
COPY . /src
CMD  npm i && npm run build && npm run start