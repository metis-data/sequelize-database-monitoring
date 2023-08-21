ssh-keygen -R '[localhost]:58222'
pkill -f "ssh -i $(pwd)/ssh_tunnel/tunnel_rsa tunnel@localhost -p 58222"
docker stop sequelize_database_monitoring -t 1
docker rm --force sequelize_database_monitoring
docker rmi --force sequelize_database_monitoring
docker stop sequelize_database_monitoring_ssh -t 1
docker rm --force sequelize_database_monitoring_ssh
docker rmi --force sequelize_database_monitoring_ssh
docker rmi --force public.ecr.aws/o2c0x5x8/community-images-backup:lscr.io-linuxserver-openssh-server
docker rmi --force public.ecr.aws/o2c0x5x8/application-base:node-express-postgres-sequelize
docker system prune
docker volume prune