docker build -t meetpoint-backend .
docker run -p 5000:5000 --env-file .env meetpoint-backend