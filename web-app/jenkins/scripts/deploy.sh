#!/usr/bin/env sh

echo "Deploy HMI Webapp $NPL_URL ($BUILD_ENV) - tag $TAG"

DOCKER_COMPOSE_FILE_NAME=docker-compose-jenkins.yml
REMOTE_DOCKER_COMPOSE_DIR=/projects/docker-compose
SSH_KEY_FILE_NAME=./ssh.pem

set -x
cat $SSH_KEY_FILE > $SSH_KEY_FILE_NAME
chmod 600 $SSH_KEY_FILE_NAME

scp -i $SSH_KEY_FILE_NAME ./docker/$DOCKER_COMPOSE_FILE_NAME $SSH_USERNAME@$NPL_URL:$REMOTE_DOCKER_COMPOSE_DIR/
ssh -i $SSH_KEY_FILE_NAME $SSH_USERNAME@$NPL_URL "
  cd $REMOTE_DOCKER_COMPOSE_DIR
  echo -e \"TAG=$TAG\" > .env
  docker login -u $NPL_REGISTRY_USERNAME -p $NPL_REGISTRY_PW $NPL_REGISTRY_URL
  docker-compose -f $DOCKER_COMPOSE_FILE_NAME pull
  docker-compose -f $DOCKER_COMPOSE_FILE_NAME up -d --no-deps home-made-inn-web-app
  rm -rf .env
  rm -rf $DOCKER_COMPOSE_FILE_NAME
"
OUT=$?
set +x

if [ $OUT -eq 0 ]
then
  exit 0
else
  echo 'Failure: deploy'
  exit 1
fi
