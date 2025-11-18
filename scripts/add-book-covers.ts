import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'mysql2/promise';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const COVERS_DIR = './uploads/book-covers';
const TARGET_BOOK_COUNT = 50;

// Sample book data for creating additional books if needed
const sampleBooks = [
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061120084', publishedYear: 1960 },
  { title: '1984', author: 'George Orwell', isbn: '978-0451524935', publishedYear: 1949 },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', publishedYear: 1925 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-0141439518', publishedYear: 1813 },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '978-0316769174', publishedYear: 1951 },
  { title: 'Animal Farm', author: 'George Orwell', isbn: '978-0451526342', publishedYear: 1945 },
  { title: 'Lord of the Flies', author: 'William Golding', isbn: '978-0399501487', publishedYear: 1954 },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '978-0547928227', publishedYear: 1937 },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', isbn: '978-1451673319', publishedYear: 1953 },
  { title: 'Brave New World', author: 'Aldous Huxley', isbn: '978-0060850524', publishedYear: 1932 },
  { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', isbn: '978-0544003415', publishedYear: 1954 },
  { title: 'Jane Eyre', author: 'Charlotte Brontë', isbn: '978-0141441146', publishedYear: 1847 },
  { title: 'Wuthering Heights', author: 'Emily Brontë', isbn: '978-0141439556', publishedYear: 1847 },
  { title: 'Moby-Dick', author: 'Herman Melville', isbn: '978-1503280786', publishedYear: 1851 },
  { title: 'The Odyssey', author: 'Homer', isbn: '978-0140268867', publishedYear: -800 },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', isbn: '978-0486415871', publishedYear: 1866 },
  { title: 'War and Peace', author: 'Leo Tolstoy', isbn: '978-1400079988', publishedYear: 1869 },
  { title: 'The Divine Comedy', author: 'Dante Alighieri', isbn: '978-0142437223', publishedYear: 1320 },
  { title: 'Don Quixote', author: 'Miguel de Cervantes', isbn: '978-0060934347', publishedYear: 1605 },
  { title: 'Hamlet', author: 'William Shakespeare', isbn: '978-0743477123', publishedYear: 1603 },
  { title: 'Macbeth', author: 'William Shakespeare', isbn: '978-0743477109', publishedYear: 1606 },
  { title: 'Romeo and Juliet', author: 'William Shakespeare', isbn: '978-0743477116', publishedYear: 1597 },
  { title: 'The Adventures of Huckleberry Finn', author: 'Mark Twain', isbn: '978-0486280615', publishedYear: 1884 },
  { title: 'Les Misérables', author: 'Victor Hugo', isbn: '978-0451419439', publishedYear: 1862 },
  { title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', isbn: '978-0140449266', publishedYear: 1844 },
  { title: 'Anna Karenina', author: 'Leo Tolstoy', isbn: '978-0143035008', publishedYear: 1877 },
  { title: 'Madame Bovary', author: 'Gustave Flaubert', isbn: '978-0140449129', publishedYear: 1856 },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', isbn: '978-0374528379', publishedYear: 1880 },
  { title: 'Great Expectations', author: 'Charles Dickens', isbn: '978-0141439563', publishedYear: 1861 },
  { title: 'A Tale of Two Cities', author: 'Charles Dickens', isbn: '978-0141439600', publishedYear: 1859 },
  { title: 'Oliver Twist', author: 'Charles Dickens', isbn: '978-0141439747', publishedYear: 1838 },
  { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', isbn: '978-0141439570', publishedYear: 1890 },
  { title: 'Dracula', author: 'Bram Stoker', isbn: '978-0486411095', publishedYear: 1897 },
  { title: 'Frankenstein', author: 'Mary Shelley', isbn: '978-0486282114', publishedYear: 1818 },
  { title: 'The Strange Case of Dr Jekyll and Mr Hyde', author: 'Robert Louis Stevenson', isbn: '978-0486266886', publishedYear: 1886 },
  { title: 'Heart of Darkness', author: 'Joseph Conrad', isbn: '978-0486264646', publishedYear: 1899 },
  { title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne', isbn: '978-0486280486', publishedYear: 1850 },
  { title: 'The Grapes of Wrath', author: 'John Steinbeck', isbn: '978-0143039433', publishedYear: 1939 },
  { title: 'Of Mice and Men', author: 'John Steinbeck', isbn: '978-0140177398', publishedYear: 1937 },
  { title: 'The Old Man and the Sea', author: 'Ernest Hemingway', isbn: '978-0684801223', publishedYear: 1952 },
  { title: 'For Whom the Bell Tolls', author: 'Ernest Hemingway', isbn: '978-0684803357', publishedYear: 1940 },
  { title: 'A Farewell to Arms', author: 'Ernest Hemingway', isbn: '978-0684801469', publishedYear: 1929 },
  { title: 'The Sun Also Rises', author: 'Ernest Hemingway', isbn: '978-0743297332', publishedYear: 1926 },
  { title: 'Catch-22', author: 'Joseph Heller', isbn: '978-0684833392', publishedYear: 1961 },
  { title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', isbn: '978-0385333849', publishedYear: 1969 },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', isbn: '978-0060883287', publishedYear: 1967 },
  { title: 'The Metamorphosis', author: 'Franz Kafka', isbn: '978-0486290300', publishedYear: 1915 },
  { title: 'The Trial', author: 'Franz Kafka', isbn: '978-0805209990', publishedYear: 1925 },
  { title: 'The Stranger', author: 'Albert Camus', isbn: '978-0679720201', publishedYear: 1942 },
  { title: 'The Plague', author: 'Albert Camus', isbn: '978-0679720218', publishedYear: 1947 },
];

async function downloadImage(url: string, filepath: string): Promise<void> {
  // This function is no longer needed - we'll create SVG files instead
  return Promise.resolve();
}

function createSVGCover(title: string, color: string, index: number): string {
  const width = 400;
  const height = 600;
  
  // Wrap text for long titles
  const maxCharsPerLine = 20;
  const words = title.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + word).length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  
  // Limit to 3 lines
  const displayLines = lines.slice(0, 3);
  if (lines.length > 3) {
    displayLines[2] = displayLines[2].substring(0, 17) + '...';
  }
  
  const yStart = height / 2 - (displayLines.length * 25);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="${yStart}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
    ${displayLines.map((line, i) => `<tspan x="50%" dy="${i === 0 ? 0 : 30}">${line}</tspan>`).join('')}
  </text>
  <text x="50%" y="${height - 40}" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.7)" text-anchor="middle">
    Book #${index + 1}
  </text>
</svg>`;
}

async function main() {
  // Create covers directory if it doesn't exist
  if (!fs.existsSync(COVERS_DIR)) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
  }

  // Connect to database
  const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USER || 'nestuser',
    password: process.env.DB_PASSWORD || 'nestpassword',
    database: process.env.DB_NAME || 'nestjs_library',
  });

  try {
    console.log('Checking existing books...');
    const [existingBooks]: any = await pool.query('SELECT * FROM book ORDER BY id');
    console.log(`Found ${existingBooks.length} existing books`);

    // Create additional books if needed
    let booksToProcess = [...existingBooks];
    const booksNeeded = TARGET_BOOK_COUNT - existingBooks.length;

    if (booksNeeded > 0) {
      console.log(`Creating ${booksNeeded} additional books...`);
      
      for (let i = 0; i < booksNeeded && i < sampleBooks.length; i++) {
        const bookData = sampleBooks[i];
        
        // Check if ISBN already exists
        const [existing]: any = await pool.query('SELECT * FROM book WHERE isbn = ?', [bookData.isbn]);
        
        if (existing.length === 0) {
          const [result]: any = await pool.query(
            'INSERT INTO book (title, author, isbn, publishedYear) VALUES (?, ?, ?, ?)',
            [bookData.title, bookData.author, bookData.isbn, bookData.publishedYear]
          );
          
          const [newBook]: any = await pool.query('SELECT * FROM book WHERE id = ?', [result.insertId]);
          booksToProcess.push(newBook[0]);
          console.log(`  ✓ Created: ${bookData.title}`);
        }
      }
    }

    // Limit to 50 books
    booksToProcess = booksToProcess.slice(0, TARGET_BOOK_COUNT);
    console.log(`\nProcessing ${booksToProcess.length} books for cover images...`);

    // Download and assign cover images
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    
    for (let i = 0; i < booksToProcess.length; i++) {
      const book = booksToProcess[i];
      const color = colors[i % colors.length];
      const timestamp = Date.now() + i;
      const filename = `book-cover-${timestamp}.svg`;
      const filepath = path.join(COVERS_DIR, filename);

      try {
        // Create SVG cover image
        const svgContent = createSVGCover(book.title, color, i);
        fs.writeFileSync(filepath, svgContent, 'utf-8');
        
        // Update database
        await pool.query(
          'UPDATE book SET coverImageFilename = ? WHERE id = ?',
          [filename, book.id]
        );

        console.log(`  ✓ [${i + 1}/${booksToProcess.length}] Added cover to: ${book.title}`);
      } catch (error) {
        console.error(`  ✗ [${i + 1}/${booksToProcess.length}] Failed for: ${book.title}`, error instanceof Error ? error.message : error);
      }
    }

    console.log('\n✅ Successfully added covers to all books!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
