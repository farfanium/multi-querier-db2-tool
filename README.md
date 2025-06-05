# Multi-Querier DB2 Tool

A web-based application for executing multiple SQL queries against a DB2 database simultaneously. Built with Spring Boot backend and modern web frontend.

## Features

- **Multiple Query Execution**: Execute multiple SQL queries in parallel with tabular interface
- **Dynamic Row Management**: Add and remove query rows on demand
- **Real-time Results**: Display query results with execution time and row count
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Security**: Only SELECT queries are allowed for security
- **Modern UI**: Responsive Bootstrap-based interface with Font Awesome icons
- **Keyboard Shortcuts**: Ctrl+Enter to execute, Ctrl+Shift+N to add new row

## Prerequisites

- Java 11 or higher
- DB2 database server
- Gradle 8.8 (included via wrapper)

## Configuration

1. Update the database connection settings in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:db2://your-db2-host:50000/your-database
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Quick Start

### Option 1: Using the Deployment Script (Recommended)

1. **Quick setup and run:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh run
   ```

2. **Docker deployment:**
   ```bash
   ./deploy.sh docker-run
   ```

### Option 2: Manual Setup

### Using Gradle Wrapper (Recommended)

1. **Build the application:**
   ```bash
   ./gradlew build
   ```

2. **Run the application:**
   ```bash
   ./gradlew bootRun
   ```

3. **Access the application:**
   Open your browser and navigate to: `http://localhost:8080`

### Docker Deployment

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Using JAR file

1. **Build the JAR:**
   ```bash
   ./gradlew bootJar
   ```

2. **Run the JAR:**
   ```bash
   java -jar build/libs/multiquerier-1.0.0.jar
   ```

## Usage

1. **Add Query Rows**: Click the "Add Query Row" button to create new query input fields
2. **Enter SQL Query**: Type your SELECT query in the textarea
3. **Execute Query**: Click "Execute" button or press Ctrl+Enter
4. **View Results**: Results will appear in the adjacent column with execution details
5. **Clear Results**: Use "Clear" button to reset query and results
6. **Remove Row**: Click the trash icon to remove a query row

## API Endpoints

- `POST /api/query/execute` - Execute a SQL query
- `GET /api/query/health` - Check API health status

## Project Structure

```
multiquerier/
├── build.gradle                   # Gradle build configuration
├── settings.gradle                # Gradle settings
├── gradlew                       # Gradle wrapper script (Unix)
├── gradlew.bat                   # Gradle wrapper script (Windows)
├── deploy.sh                     # Deployment script
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose configuration
├── application-sample.properties # Sample configuration file
├── .gitignore                    # Git ignore file
├── README.md                     # This file
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
└── src/
    └── main/
        ├── java/
        │   └── com/multiquerier/
        │       ├── MultiQuerierApplication.java
        │       ├── config/
        │       │   └── WebConfig.java
        │       ├── controller/
        │       │   └── QueryController.java
        │       ├── dto/
        │       │   ├── QueryRequest.java
        │       │   └── QueryResponse.java
        │       └── service/
        │           └── QueryService.java
        └── resources/
            ├── application.properties
            └── static/
                ├── index.html
                ├── css/
                │   └── style.css
                └── js/
                    └── app.js
```

## Technologies Used

### Backend
- **Spring Boot 2.7.14** - Application framework
- **Spring Web** - REST API development
- **Spring JDBC** - Database connectivity
- **IBM DB2 Driver** - DB2 database connectivity
- **Lombok** - Boilerplate code reduction
- **SLF4J** - Logging framework
- **Java 11** - Programming language
- **Gradle 8.8** - Build tool

### Frontend
- **HTML5** - Markup language
- **Bootstrap 5.3** - CSS framework
- **Font Awesome 6.0** - Icons
- **Vanilla JavaScript** - Client-side scripting

## Security Features

- Only SELECT and WITH queries are allowed
- Input validation and sanitization
- Error handling prevents information disclosure
- CORS configuration for secure cross-origin requests

## Logging

The application uses SLF4J with Logback for comprehensive logging:

- Query execution details
- Error tracking and debugging
- Performance monitoring (execution times)
- API request/response logging

## Development

### Running in Development Mode

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### Building for Production

```bash
./gradlew clean build
```

## Troubleshooting

### Common Issues

1. **Connection Issues**: Verify DB2 server is running and connection details are correct
2. **Port Conflicts**: Change server port in `application.properties` if 8080 is in use
3. **Java Version**: Ensure Java 11+ is installed and configured
4. **Permission Issues**: Make sure `gradlew` has execute permissions

### Logs Location

Application logs are written to the console by default. For file logging, add to `application.properties`:

```properties
logging.file.name=logs/multiquerier.log
logging.level.com.multiquerier=DEBUG
```

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
