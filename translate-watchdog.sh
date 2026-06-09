#!/bin/bash
# Auto-restart translate server when it crashes
while true; do
  echo "Starting translate server..."
  node /home/z/my-project/translate-server.js
  echo "Translate server exited, restarting in 2 seconds..."
  sleep 2
done
