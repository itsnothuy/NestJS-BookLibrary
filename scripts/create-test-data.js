const API_BASE = 'http://localhost:3000';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYTBjYmVlNi1iOTRhLTExZjAtYjUwMC1hYTBjYzMzZTIzYTQiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYyNDg4MDIwLCJleHAiOjE3NjI0OTE2MjB9.R0ANzDbqa69ULiFw_PF9jx3jl5P5Vt0SPYr-LnVlGK0';

// Sample book data
const books = [
  { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0-06-112008-4", publishedYear: 1960 },
  { title: "1984", author: "George Orwell", isbn: "978-0-452-28423-4", publishedYear: 1949 },
  { title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0-14-143951-8", publishedYear: 1813 },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0-7432-7356-5", publishedYear: 1925 },
  { title: "Lord of the Flies", author: "William Golding", isbn: "978-0-571-05686-2", publishedYear: 1954 },
  { title: "Animal Farm", author: "George Orwell", isbn: "978-0-452-28424-1", publishedYear: 1945 },
  { title: "Brave New World", author: "Aldous Huxley", isbn: "978-0-06-085052-4", publishedYear: 1932 },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "978-0-316-76948-0", publishedYear: 1951 },
  { title: "Of Mice and Men", author: "John Steinbeck", isbn: "978-0-14-017739-8", publishedYear: 1937 },
  { title: "Jane Eyre", author: "Charlotte Brontë", isbn: "978-0-14-144114-6", publishedYear: 1847 },
  { title: "Wuthering Heights", author: "Emily Brontë", isbn: "978-0-14-143955-6", publishedYear: 1847 },
  { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "978-0-547-92822-7", publishedYear: 1937 },
  { title: "Fahrenheit 451", author: "Ray Bradbury", isbn: "978-0-345-34296-8", publishedYear: 1953 },
  { title: "Romeo and Juliet", author: "William Shakespeare", isbn: "978-0-14-144218-1", publishedYear: 1597 },
  { title: "Hamlet", author: "William Shakespeare", isbn: "978-0-14-144257-0", publishedYear: 1603 },
  { title: "Macbeth", author: "William Shakespeare", isbn: "978-0-14-144258-7", publishedYear: 1623 },
  { title: "The Odyssey", author: "Homer", isbn: "978-0-14-044911-2", publishedYear: -800 },
  { title: "The Iliad", author: "Homer", isbn: "978-0-14-044592-3", publishedYear: -750 },
  { title: "Don Quixote", author: "Miguel de Cervantes", isbn: "978-0-06-093434-4", publishedYear: 1605 },
  { title: "Moby Dick", author: "Herman Melville", isbn: "978-0-14-243724-7", publishedYear: 1851 }
];

// Sample user data
const users = [
  { email: "student1@university.edu", password: "password123", role: "student" },
  { email: "student2@university.edu", password: "password123", role: "student" },
  { email: "student3@university.edu", password: "password123", role: "student" },
  { email: "student4@university.edu", password: "password123", role: "student" },
  { email: "student5@university.edu", password: "password123", role: "student" },
  { email: "student6@university.edu", password: "password123", role: "student" },
  { email: "student7@university.edu", password: "password123", role: "student" },
  { email: "student8@university.edu", password: "password123", role: "student" },
  { email: "student9@university.edu", password: "password123", role: "student" },
  { email: "student10@university.edu", password: "password123", role: "student" },
  { email: "student11@university.edu", password: "password123", role: "student" },
  { email: "student12@university.edu", password: "password123", role: "student" },
  { email: "student13@university.edu", password: "password123", role: "student" },
  { email: "student14@university.edu", password: "password123", role: "student" },
  { email: "student15@university.edu", password: "password123", role: "student" },
  { email: "librarian1@university.edu", password: "password123", role: "admin" },
  { email: "librarian2@university.edu", password: "password123", role: "admin" },
  { email: "librarian3@university.edu", password: "password123", role: "admin" },
  { email: "professor1@university.edu", password: "password123", role: "admin" },
  { email: "professor2@university.edu", password: "password123", role: "admin" }
];

async function createBooks() {
  console.log('Creating 20 books...');
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    try {
      const response = await fetch(`${API_BASE}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        body: JSON.stringify(book)
      });
      
      if (response.ok) {
        const created = await response.json();
        console.log(`✅ Created book ${i + 1}/20: "${book.title}" by ${book.author}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create book "${book.title}": ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating book "${book.title}": ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log('Books creation completed!');
}

async function createUsers() {
  console.log('Creating 20 users...');
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        const created = await response.json();
        console.log(`✅ Created user ${i + 1}/20: ${user.email} (${user.role})`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create user "${user.email}": ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating user "${user.email}": ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log('Users creation completed!');
}

async function main() {
  console.log('🚀 Starting test data creation...');
  
  await createBooks();
  console.log('\n');
  await createUsers();
  
  console.log('\n🎉 Test data creation completed!');
  console.log('\nYou can now test pagination with:');
  console.log('- Books: GET /books?page=1&limit=5');
  console.log('- Users: GET /users?page=1&limit=5');
}

// For Node.js environment
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}

// For browser environment  
if (typeof window !== 'undefined') {
  window.createTestData = main;
}