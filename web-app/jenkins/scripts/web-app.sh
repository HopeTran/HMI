#!/usr/bin/env sh

echo "Building docker image for HMI WebApp ($BUILD_ENV), tag $TAG"

set -x
cat $HMI_WEB_APP_ENV_FILE > ./.env
docker build -t home-made-inn-web-app:$TAG \
             --build-arg GIT_COMMIT=$GIT_COMMIT \
             -f ./docker/Dockerfile-home-made-inn-web-app .
OUT=$?
set +x

if [ $OUT -eq 0 ]
then
  exit 0
else
  echo 'Failure: docker build'
  exit 1
fi
