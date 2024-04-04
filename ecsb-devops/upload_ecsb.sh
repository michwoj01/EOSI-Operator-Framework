export PROJECT_NAME=$1
export SERVER_NAME=$2
scp systemd_services/${PROJECT_NAME}.service ${SERVER_NAME}:~/$PROJECT_NAME.service
ssh $SERVER_NAME "sudo cp ~/build-jars/'$PROJECT_NAME'-all.jar /app/'$PROJECT_NAME'-all.jar"
ssh $SERVER_NAME "sudo mv ~/'$PROJECT_NAME'.service /etc/systemd/system/"
ssh $SERVER_NAME "sudo systemctl daemon-reload"
ssh $SERVER_NAME "sudo systemctl restart $PROJECT_NAME"
