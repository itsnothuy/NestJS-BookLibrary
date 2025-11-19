#!/bin/bash

# Book Lending System - Database Setup Script
# Run this script to set up the borrowing system tables

set -e  # Exit on error

echo "🚀 Setting up Book Lending System Database..."
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: .env file not found. Using default values."
fi

# Database connection details
DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-3307}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-library}

echo "📊 Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Prompt for password
echo "🔐 Enter database password:"
read -s DB_PASSWORD

echo ""
echo "📝 Running migrations..."
echo ""

# Function to run a migration
run_migration() {
    local file=$1
    local name=$2
    
    echo "  ➜ Running: $name"
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < $file
    
    if [ $? -eq 0 ]; then
        echo "  ✅ $name completed successfully"
    else
        echo "  ❌ $name failed"
        exit 1
    fi
    echo ""
}

# Run migrations in order
run_migration "src/database/migrations/create_borrowing_requests.sql" "Borrowing Requests Table"
run_migration "src/database/migrations/create_borrowings.sql" "Borrowings Table"
run_migration "src/database/migrations/create_book_inventory.sql" "Book Inventory Table"

echo "✨ All migrations completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Start your backend: npm run start:dev"
echo "  2. Start your frontend: cd frontend && npm run dev"
echo "  3. Test the borrowing endpoints"
echo ""
echo "📚 Documentation:"
echo "  - Design: LENDING_SYSTEM_DESIGN.md"
echo "  - Summary: LENDING_SYSTEM_IMPLEMENTATION_SUMMARY.md"
echo ""
echo "🎉 Happy borrowing!"
