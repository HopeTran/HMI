#!/usr/bin/env sh

echo "Push image $TAG to registry"

set -x
docker tag home-made-inn-web-app:$TAG docker-reg.narrowpacific.com/home-made-inn-web-app:$TAG

docker push docker-reg.narrowpacific.com/home-made-inn-web-app:$TAG

OUT=$?
set +x

if [ $OUT -eq 0 ]
then
  exit 0
else
  echo 'Failure: push'
  exit 1
fi
