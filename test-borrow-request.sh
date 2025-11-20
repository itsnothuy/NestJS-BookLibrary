#!/bin/bash

# Test borrowing request endpoint

# First, login to get a token
echo "Logging in as student..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to login. Response:"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "✅ Logged in successfully"
echo "Token: ${TOKEN:0:20}..."

# Get a book UUID
echo -e "\nFetching books..."
BOOK_UUID=$(curl -s http://localhost:3000/books | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$BOOK_UUID" ]; then
  echo "❌ No books found"
  exit 1
fi

echo "✅ Found book UUID: $BOOK_UUID"

# Check availability
echo -e "\nChecking book availability..."
curl -s http://localhost:3000/borrowings/availability/$BOOK_UUID

# Try to borrow
echo -e "\n\nSubmitting borrow request..."
BORROW_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:3000/borrowings/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"bookUuid\":\"$BOOK_UUID\",\"requestedDays\":14}")

HTTP_CODE=$(echo "$BORROW_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$BORROW_RESPONSE" | sed 's/HTTP_CODE:[0-9]*//')

echo "Response body:"
echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
echo -e "\nHTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Borrow request created successfully!"
else
  echo "❌ Failed with HTTP $HTTP_CODE"
fi
