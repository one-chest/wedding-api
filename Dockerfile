FROM node

WORKDIR /app
COPY . /app
RUN npm install

EXPOSE 5050

CMD ["npm", "start"]