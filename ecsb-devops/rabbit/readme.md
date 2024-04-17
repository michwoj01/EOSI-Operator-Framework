# RabbitMQ

Configuration could be found under /etc/rabbitmq - you can use properties defined in rabbitmq.conf.

User and vhost definitions are stored inside user_config_export.json.

Management (15672), prometheus and sharding plugins are enabled

    sudo docker exec -i inzdb_15 /bin/bash -c "PGPASSWORD=postgres psql --username postgres mydb" < /home/ubuntu/dump.sql
    sudo docker cat rabbitmq.conf >> rabbitmq:/etc/rabbitmq/conf.d/10-defaults.conf
    sudo docker cp enabled_plugins rabbitmq:/etc/rabbitmq/enabled_plugins
    curl -O https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/v3.12.x/deps/rabbitmq_management/bin/rabbitmqadmin
    sudo chown 700 rabbitmqadmin
    sudo chmod 777 rabbitmqadmin
    sudo mv /home/ubuntu/rabbitmqadmin /usr/bin
    sudo rabbitmqadmin import user_config_export.json
