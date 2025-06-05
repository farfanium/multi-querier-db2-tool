# Multi-stage build
FROM openjdk:11-jdk-slim as build

# Set working directory
WORKDIR /app

# Copy gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Copy source code
COPY src src

# Make gradlew executable
RUN chmod +x ./gradlew

# Build the application
RUN ./gradlew clean bootJar --no-daemon

# Runtime stage
FROM openjdk:11-jre-slim

# Create app directory
RUN mkdir /app

# Copy the JAR file from build stage
COPY --from=build /app/build/libs/*.jar /app/multiquerier.jar

# Create non-root user
RUN addgroup --system appgroup && adduser --system --group appuser
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/query/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/app/multiquerier.jar"]
