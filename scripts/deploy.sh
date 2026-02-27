#!/bin/bash

# Oscar Yan Property Website - Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environment: dev | prod (default: prod)

set -e

# Configuration
PROJECT_ID="oscar-property-1cc52"
SERVICE_NAME="oscar-yan-property"
REGION="asia-southeast1"
REPOSITORY="docker-images"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Oscar Yan Property - Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 &> /dev/null; then
    echo -e "${YELLOW}Not authenticated. Starting authentication...${NC}"
    gcloud auth login
fi

# Set the project
echo -e "${YELLOW}Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    --project=$PROJECT_ID

# Create Artifact Registry repository if not exists
echo -e "${YELLOW}Checking Artifact Registry repository...${NC}"
if ! gcloud artifacts repositories describe $REPOSITORY --location=$REGION &> /dev/null; then
    echo -e "${YELLOW}Creating Artifact Registry repository...${NC}"
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker images for Oscar Yan Property"
fi

# Build and deploy
echo -e "${GREEN}Starting build and deployment...${NC}"

# Build using Cloud Build
gcloud builds submit \
    --config=docker/cloudbuild.yaml \
    --substitutions=_SERVICE_NAME=$SERVICE_NAME,_REGION=$REGION,_REPOSITORY=$REPOSITORY \
    --project=$PROJECT_ID

# Get the deployed URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform=managed \
    --region=$REGION \
    --format="value(status.url)")

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Service URL: ${YELLOW}${SERVICE_URL}${NC}"
echo ""
echo -e "To test: curl ${SERVICE_URL}/health"
