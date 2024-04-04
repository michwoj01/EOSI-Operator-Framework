scp ./nginx.conf [host]:/etc/nginx/sites-available/default
ssh [user]@[host] 'sudo service nginx reload'