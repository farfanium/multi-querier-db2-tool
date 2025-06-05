#!/bin/bash

# Multi-Querier DB2 Tool - Deployment Script
# This script helps deploy the application in different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Java 11+ is installed
check_java() {
    print_info "Checking Java version..."
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install Java 11 or higher."
        exit 1
    fi
    
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1-2)
    JAVA_MAJOR=$(echo $JAVA_VERSION | cut -d'.' -f1)
    
    if [[ $JAVA_MAJOR -lt 11 ]]; then
        print_error "Java 11 or higher is required. Current version: $JAVA_VERSION"
        exit 1
    fi
    
    print_success "Java version: $JAVA_VERSION"
}

# Build the application
build_app() {
    print_info "Building the application..."
    ./gradlew clean build --no-daemon
    print_success "Application built successfully"
}

# Run the application
run_app() {
    print_info "Starting the application..."
    print_warning "Make sure to configure your database connection in application.properties"
    print_info "Application will be available at: http://localhost:8080"
    ./gradlew bootRun --no-daemon
}

# Build Docker image
build_docker() {
    print_info "Building Docker image..."
    docker build -t multiquerier:latest .
    print_success "Docker image built successfully"
}

# Run with Docker
run_docker() {
    print_info "Starting application with Docker..."
    print_warning "Make sure to update database configuration in docker-compose.yml"
    docker-compose up -d
    print_success "Application started with Docker"
    print_info "Application will be available at: http://localhost:8080"
    print_info "Check logs with: docker-compose logs -f"
}

# Stop Docker containers
stop_docker() {
    print_info "Stopping Docker containers..."
    docker-compose down
    print_success "Docker containers stopped"
}

# Show help
show_help() {
    echo "Multi-Querier DB2 Tool - Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  check-java    Check if Java 11+ is installed"
    echo "  build         Build the application"
    echo "  run           Run the application locally"
    echo "  docker-build  Build Docker image"
    echo "  docker-run    Run with Docker Compose"
    echo "  docker-stop   Stop Docker containers"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build       # Build the application"
    echo "  $0 run         # Run locally"
    echo "  $0 docker-run  # Run with Docker"
    echo ""
}

# Main script logic
case "${1:-help}" in
    check-java)
        check_java
        ;;
    build)
        check_java
        build_app
        ;;
    run)
        check_java
        build_app
        run_app
        ;;
    docker-build)
        build_docker
        ;;
    docker-run)
        build_docker
        run_docker
        ;;
    docker-stop)
        stop_docker
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
