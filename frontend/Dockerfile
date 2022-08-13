FROM node:13.12.0-alpine
WORKDIR /app/frontend

COPY package.json /app/frontend/
COPY package-lock.json /app/frontend/
RUN npm install 
RUN npm install react-scripts@3.4.1 -g 
COPY . /app/frontend
EXPOSE 3000