#!/bin/bash
# 根据项目自动切换 GCP 和 Firebase 环境

PROJECT=$1

if [ "$PROJECT" == "oscar" ]; then
  gcloud config set project oscar-property-1cc52
  firebase use oscar-property-1cc52
  echo "Switched to Oscar Yan (property agent) project"
elif [ "$PROJECT" == "jinshan" ]; then
  gcloud config set project buyzenso-asga
  firebase use buyzenso-asga
  echo "Switched to Jinshan Temple project"
elif [ "$PROJECT" == "xuanxuan" ]; then
  gcloud config set project xuanxuanstreetwearlive
  echo "Switched to Xuanxuan project"
else
  echo "Usage: ./scripts/switch-env.sh [oscar|jinshan|xuanxuan]"
fi
