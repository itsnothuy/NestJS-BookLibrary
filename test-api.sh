#!/bin/bash

# Script to test the NestJS BookLibrary API

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
print_status "INFO" "Step 1: Checking prerequisites..."

if ! command_exists curl; then
    print_status "ERROR" "curl is not installed"
    exit 1
fi

if ! command_exists node; then
    print_status "ERROR" "Node.js is not installed"
    exit 1
fi

print_status "SUCCESS" "All prerequisites are available"

# Step 0: Reset the Database
print_status "INFO" "Step 0: Resetting the database..."

# Stop and remove the MariaDB container
print_status "INFO" "Stopping and removing the MariaDB container..."
docker stop mariadb-dev >/dev/null 2>&1
if docker rm mariadb-dev >/dev/null 2>&1; then
    print_status "SUCCESS" "MariaDB container removed."
else
    print_status "WARNING" "MariaDB container was not running."
fi

# Remove the MariaDB data volume
print_status "INFO" "Removing the MariaDB data volume..."
if docker volume rm student-library-api_mariadb_data >/dev/null 2>&1; then
    print_status "SUCCESS" "MariaDB data volume removed."
else
    print_status "WARNING" "MariaDB data volume not found."
fi

# Start fresh MariaDB container
print_status "INFO" "Starting a fresh MariaDB container..."
docker-compose up -d mariadb
if [ $? -eq 0 ]; then
    print_status "SUCCESS" "MariaDB container started."
else
    print_status "ERROR" "Failed to start MariaDB container."
    exit 1
fi

# Wait for MariaDB to be ready and create user table
print_status "INFO" "Waiting for MariaDB to be ready..."
for i in {1..30}; do
  if docker exec mariadb-dev mariadb -u nestuser -pnestpassword -e "SELECT 1" >/dev/null 2>&1; then
    print_status "SUCCESS" "MariaDB is ready"
    break
  fi
  sleep 2
done

# Create user table
print_status "INFO" "Creating user table..."
docker exec mariadb-dev mariadb -u nestuser -pnestpassword -e "USE nestjs_library; CREATE TABLE IF NOT EXISTS user (id VARCHAR(36) PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, passwordHash VARCHAR(255) NOT NULL, role ENUM('student', 'admin') NOT NULL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);" >/dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "SUCCESS" "User table created/verified"
else
    print_status "ERROR" "Failed to create user table"
    exit 1
fi

# Step 0.5: Check for processes using port 3000
print_status "INFO" "Checking for processes using port 3000..."
PORT_3000_PROCESSES=$(lsof -ti:3000)
if [ -n "$PORT_3000_PROCESSES" ]; then
    print_status "WARNING" "Processes found using port 3000: $PORT_3000_PROCESSES"
else
    print_status "SUCCESS" "No processes are using port 3000"
fi

# Kill processes using port 3000 if any
if [ -n "$PORT_3000_PROCESSES" ]; then
    print_status "INFO" "Terminating processes using port 3000..."
    echo "$PORT_3000_PROCESSES" | xargs kill -9
    print_status "SUCCESS" "Terminated processes using port 3000"
fi

# Step 0.6: Run database migrations
print_status "INFO" "Running database migrations..."
npx ts-node src/database/migrate.ts
if [ $? -eq 0 ]; then
    print_status "SUCCESS" "Migrations applied successfully"
else
    print_status "ERROR" "Failed to apply migrations"
    exit 1
fi

# Step 2: Start the NestJS application
print_status "INFO" "Step 2: Starting the NestJS application..."
npm run start:dev &
NEST_PID=$!

# Wait for the application to start
sleep 10

# Step 3: Test MariaDB connection
print_status "INFO" "Step 3: Testing MariaDB connection..."
MARIADB_TEST=$(docker exec mariadb-dev mariadb -u nestuser -pnestpassword -e "SELECT 1 as test;" 2>/dev/null)

if [[ $MARIADB_TEST == *"test"* ]]; then
    print_status "SUCCESS" "MariaDB connection successful"
else
    print_status "ERROR" "Failed to connect to MariaDB"
    echo "Debug: Checking MariaDB container status..."
    docker ps | grep mariadb
    exit 1
fi

# Step 3: Test API endpoints
print_status "INFO" "Step 3: Testing API endpoints..."

# Test 1: Health check
print_status "INFO" "Testing health check endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ "$HEALTH_RESPONSE" -eq 200 ]; then
    print_status "SUCCESS" "Health check passed"
else
    print_status "ERROR" "Health check failed with status code $HEALTH_RESPONSE"
    kill $NEST_PID
    exit 1
fi

# Additional Tests for Authentication and Database

# Test 2: Signup Endpoint
print_status "INFO" "Testing signup endpoint..."
SIGNUP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"TestPassword123"}')
if [ "$SIGNUP_RESPONSE" -eq 201 ]; then
    print_status "SUCCESS" "Signup test passed"
else
    print_status "ERROR" "Signup test failed with status code $SIGNUP_RESPONSE"
fi

# Test 2.5: Create admin user manually in database for Books API testing
print_status "INFO" "Creating admin user for Books API testing..."
docker exec mariadb-dev mariadb -u nestuser -pnestpassword -e "USE nestjs_library; INSERT IGNORE INTO user (id, email, passwordHash, role) VALUES (UUID(), 'admin@example.com', '\$2b\$12\$yVBLB8dc3wwzPZ4EtzXfu.V0kWIoZrH.fLmV7K4ST422xuQcudcP6', 'admin');" >/dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "SUCCESS" "Admin user created successfully"
else
    print_status "ERROR" "Failed to create admin user"
fi

# Test 3: Login Endpoint
print_status "INFO" "Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"TestPassword123"}')
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .access_token)
if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
    print_status "SUCCESS" "Login test passed"
else
    print_status "ERROR" "Login test failed"
fi

# Test 3.1: Login as admin for Books API testing
print_status "INFO" "Testing admin login for Books API..."
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}')
ADMIN_ACCESS_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r .access_token)
if [ "$ADMIN_ACCESS_TOKEN" != "null" ] && [ -n "$ADMIN_ACCESS_TOKEN" ]; then
    print_status "SUCCESS" "Admin login test passed"
else
    print_status "ERROR" "Admin login test failed"
fi

# Test 4: Database Check
print_status "INFO" "Testing database for user existence..."
USER_EXISTS=$(docker exec mariadb-dev mariadb -u nestuser -pnestpassword -e "USE nestjs_library; SELECT email FROM user WHERE email='testuser@example.com';" 2>/dev/null | grep testuser@example.com)
if [ -n "$USER_EXISTS" ]; then
    print_status "SUCCESS" "User exists in the database"
else
    print_status "ERROR" "User does not exist in the database"
fi

# Step 3.5: Test Books API endpoints
print_status "INFO" "Step 3.5: Testing Books API endpoints..."

# Test 1: List Books (Public)
print_status "INFO" "Testing list books endpoint..."
LIST_RESPONSE=$(curl -s http://localhost:3000/books)
if [ "$(echo "$LIST_RESPONSE" | jq 'length')" -ge 0 ]; then
    print_status "SUCCESS" "List books test passed"
else
    print_status "ERROR" "List books test failed"
fi

# Test 2: Create Book (Admin)
print_status "INFO" "Testing create book endpoint..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/books \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Architecture","author":"Robert C. Martin","isbn":"9780134494166","publishedYear":2017}')
BOOK_ID=$(echo "$CREATE_RESPONSE" | jq -r .id)
if [ "$BOOK_ID" != "null" ] && [ -n "$BOOK_ID" ]; then
    print_status "SUCCESS" "Create book test passed"
else
    print_status "ERROR" "Create book test failed"
    echo "Debug: CREATE_RESPONSE = $CREATE_RESPONSE"
fi

# Test 2.1: Test ValidationPipe - Invalid ISBN
print_status "INFO" "Testing validation with invalid ISBN..."
INVALID_ISBN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/books \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Book","author":"Test Author","isbn":"invalid-isbn","publishedYear":2020}')
if [ "$INVALID_ISBN_RESPONSE" -eq 400 ]; then
    print_status "SUCCESS" "ValidationPipe correctly rejected invalid ISBN"
else
    print_status "ERROR" "ValidationPipe did not reject invalid ISBN (status: $INVALID_ISBN_RESPONSE)"
fi

# Test 2.2: Test ValidationPipe - Missing required fields
print_status "INFO" "Testing validation with missing fields..."
MISSING_FIELDS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/books \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Book"}')
if [ "$MISSING_FIELDS_RESPONSE" -eq 400 ]; then
    print_status "SUCCESS" "ValidationPipe correctly rejected missing fields"
else
    print_status "ERROR" "ValidationPipe did not reject missing fields (status: $MISSING_FIELDS_RESPONSE)"
fi

# Test 2.3: Test ValidationPipe - Invalid UUID param
print_status "INFO" "Testing UUID validation..."
INVALID_UUID_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/books/invalid-uuid)
if [ "$INVALID_UUID_RESPONSE" -eq 400 ]; then
    print_status "SUCCESS" "ParseUUIDPipe correctly rejected invalid UUID"
else
    print_status "ERROR" "ParseUUIDPipe did not reject invalid UUID (status: $INVALID_UUID_RESPONSE)"
fi

# Test 3: Get Book by ID (Public)
if [ "$BOOK_ID" != "null" ] && [ -n "$BOOK_ID" ]; then
    print_status "INFO" "Testing get book by ID endpoint..."
    GET_RESPONSE=$(curl -s http://localhost:3000/books/$BOOK_ID)
    if [ "$(echo "$GET_RESPONSE" | jq -r .id)" == "$BOOK_ID" ]; then
        print_status "SUCCESS" "Get book by ID test passed"
    else
        print_status "ERROR" "Get book by ID test failed"
    fi
else
    print_status "WARNING" "Skipping get book by ID test - no valid book ID"
fi

# Test 4: Update Book (Admin)
if [ "$BOOK_ID" != "null" ] && [ -n "$BOOK_ID" ]; then
    print_status "INFO" "Testing update book endpoint..."
    UPDATE_RESPONSE=$(curl -s -X PATCH http://localhost:3000/books/$BOOK_ID \
      -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"publishedYear":2018}')
    UPDATE_YEAR=$(echo "$UPDATE_RESPONSE" | jq -r .publishedYear)
    if [ "$UPDATE_YEAR" != "null" ] && [ "$UPDATE_YEAR" = "2018" ]; then
        print_status "SUCCESS" "Update book test passed"
    else
        print_status "ERROR" "Update book test failed"
        echo "Debug: UPDATE_RESPONSE = $UPDATE_RESPONSE"
        echo "Debug: UPDATE_YEAR = $UPDATE_YEAR"
    fi
else
    print_status "WARNING" "Skipping update book test - no valid book ID"
fi

# Test 5: Delete Book (Admin)
if [ "$BOOK_ID" != "null" ] && [ -n "$BOOK_ID" ]; then
    print_status "INFO" "Testing delete book endpoint..."
    DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:3000/books/$BOOK_ID \
      -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN")
    if [ "$DELETE_RESPONSE" == "" ]; then
        print_status "SUCCESS" "Delete book test passed"
    else
        print_status "ERROR" "Delete book test failed"
        echo "Debug: DELETE_RESPONSE = $DELETE_RESPONSE"
    fi
else
    print_status "WARNING" "Skipping delete book test - no valid book ID"
fi

# Step 4: Cleanup
print_status "INFO" "Step 4: Cleaning up..."
kill $NEST_PID
print_status "SUCCESS" "Test completed!"

# Kill the process using the port at the end of the script
PORT=3000
PID=$(lsof -t -i:$PORT)
if [ -n "$PID" ]; then
  echo "Killing process on port $PORT"
  kill -9 $PID
else
  echo "No process running on port $PORT"
fi