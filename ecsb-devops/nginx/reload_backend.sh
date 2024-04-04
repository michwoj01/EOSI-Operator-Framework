export PROJECT_NAME=$1
cp ~/build-jars/$PROJECT_NAME-all.jar /app/$PROJECT_NAME-all.jar
sudo mv ~/'$PROJECT_NAME'.service /etc/systemd/system/'
sudo systemctl daemon-reload
sudo systemctl restart $PROJECT_NAME