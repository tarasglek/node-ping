# docker build -t node-ping .
# docker run --rm -ti  -p 3000:3000 node-ping
FROM node:10-stretch
COPY ping.js .
ENTRYPOINT []
EXPOSE 3000
CMD node ping.js