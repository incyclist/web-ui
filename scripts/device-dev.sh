#!/bin/bash

CMD=$1

if [[ "$CMD" = "start" ]]; then
  echo "starting development"
  npm i ../devices
  npm i ../services
  cd ../services
  npm i ../devices
  cd ../ergo-react
fi 
 
if [[ "$CMD" = "stop" ]]; then
  echo "stopping development"
  pwd
  cd ../services
  pwd
  npm i incyclist-devices@latest
  cd ../ergo-react
  npm i incyclist-devices@latest
  npm i incyclist-services@latest
  pwd
fi
