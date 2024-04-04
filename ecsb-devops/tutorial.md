## Backend and frontend
    scp ./nginx/reload_frontend.sh ubuntu@ecsb-1:/home/ubuntu/
    scp ./nginx/nginx.conf ubuntu@ecsb-1:/home/ubuntu
    sudo apt install openjdk-11-jdk nginx certbot
    sudo snap install --classic certbot
    sudo iptables -I INPUT -p tcp -m tcp --dport 80 -j ACCEPT
    sudo iptables -I INPUT -p tcp -m tcp --dport 443 -j ACCEPT
    sudo cp -f /home/ubuntu/begin_nginx.conf /etc/nginx/sites-available/default
    sudo certbot --nginx
    sudo service nginx reload
    sudo mkdir /var/www/dev
    sudo chown -R ubuntu:ubuntu /var/www/dev
    sudo mkdir /var/www/prod
    sudo chown -R ubuntu:ubuntu /var/www/prod
    chmod +x dev-script.sh
    chmod +x prod-script.sh
    sudo mkdir /app
    sudo chown -R ubuntu:ubuntu /app
    sudo mkdir /app/logs
    sudo mkdir /app/logs/dev
    sudo mkdir /app/logs/prod

## Middleware
    scp ./docker/dump.sql ubuntu@ecsb-2:/home/ubuntu
    scp ./docker/docker-compose.yml ubuntu@ecsb-2:/home/ubuntu
    scp ./docker/inz_backend_docker.env ubuntu@ecsb-2:/home/ubuntu
    scp ./rabbit/user_config_export.json ubuntu@ecsb-2:/home/ubuntu
    scp ./rabbit/rabbitmq.conf ubuntu@ecsb-2:/home/ubuntu
    scp ./rabbit/enables_plugins ubuntu@ecsb-2:/home/ubuntu
    sudo snap install docker
    mkdir docker-compose
    mv docker-compose.yml inz_backend_docker.env ./docker-compose
    cd docker-compose
    sudo docker compose up -d
    cd ..
    sudo docker exec -i inzdb_15 /bin/bash -c "PGPASSWORD=postgres psql --username postgres mydb" < /home/ubuntu/dump.sql
    sudo docker exec -i inzdb_15 /bin/bash -c "createdb -T mydb dev_mydb -U postgres;"
    sudo docker cp rabbitmq.conf rabbitmq:/home/rabbitmq.conf
    sudo docker cp enabled_plugins rabbitmq:/etc/rabbitmq/enabled_plugins
    sudo docker exec -it rabbitmq bash
    cat /home/rabbitmq.conf >> /etc/rabbitmq/conf.d/10-defaults.conf
    exit
    curl -O https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/v3.12.x/deps/rabbitmq_management/bin/rabbitmqadmin
    sudo chown 700 rabbitmqadmin
    sudo chmod 777 rabbitmqadmin
    sudo mv /home/ubuntu/rabbitmqadmin /usr/bin
    sudo rabbitmqadmin import user_config_export.json


### Useful commands:
    systemctl --type=service
    ipconfig /flushdns
