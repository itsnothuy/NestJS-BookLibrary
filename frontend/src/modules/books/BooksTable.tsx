import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@heroui/react";
import { useAuth } from "../auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE;

// Column definitions for the books table
export const columns = [
  { name: "TITLE", uid: "title" },
  { name: "AUTHOR", uid: "author" },
  { name: "ISBN", uid: "isbn" },
  { name: "PUBLISHED YEAR", uid: "publishedYear" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

// Icons components
export const EyeIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

export const DeleteIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M8.60834 13.75H11.3833"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.91669 10.4167H12.0834"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

export const EditIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M2.5 18.3333H17.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );
};

export const PlusIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M12 5v14"/>
        <path d="M5 12h14"/>
      </g>
    </svg>
  );
};

// Types
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  createdAt: string;
  updatedAt: string;
}

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
}

const statusColorMap: Record<string, "success" | "warning" | "danger"> = {
  available: "success",
  borrowed: "warning",
  maintenance: "danger",
};

export default function BooksTable() {
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    isbn: "",
    publishedYear: null,
  });
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Fetch books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/books`);
      if (!response.ok) throw new Error("Failed to fetch books");
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Create book
  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_BASE}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create book");
      await fetchBooks();
      onAddClose();
      resetForm();
    } catch (error) {
      console.error("Error creating book:", error);
    }
  };

  // Update book
  const handleUpdate = async () => {
    if (!selectedBook) return;
    try {
      const response = await fetch(`${API_BASE}/books/${selectedBook.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update book");
      await fetchBooks();
      onEditClose();
      resetForm();
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  // Delete book
  const handleDelete = async () => {
    if (!selectedBook) return;
    try {
      const response = await fetch(`${API_BASE}/books/${selectedBook.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete book");
      await fetchBooks();
      onDeleteClose();
      setSelectedBook(null);
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      publishedYear: null,
    });
    setSelectedBook(null);
  };

  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
    });
    onEditOpen();
  };

  const openViewModal = (book: Book) => {
    setSelectedBook(book);
    onViewOpen();
  };

  const openDeleteModal = (book: Book) => {
    setSelectedBook(book);
    onDeleteOpen();
  };

  // Get book status (mock function - you can implement actual logic)
  const getBookStatus = (_book: Book) => {
    // For now, randomly assign status. You can implement actual logic based on your requirements
    const statuses = ["available", "borrowed", "maintenance"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const renderCell = useCallback((book: Book, columnKey: React.Key) => {
    const cellValue = book[columnKey as keyof Book];

    switch (columnKey) {
      case "title":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{book.title}</p>
            <p className="text-bold text-sm capitalize text-default-400">
              {book.isbn}
            </p>
          </div>
        );
      case "author":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{book.author}</p>
          </div>
        );
      case "isbn":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm font-mono">{book.isbn}</p>
          </div>
        );
      case "publishedYear":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">
              {book.publishedYear || "Unknown"}
            </p>
          </div>
        );
      case "status":
        const status = getBookStatus(book);
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[status]}
            size="sm"
            variant="flat"
          >
            {status}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="View details">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => openViewModal(book)}
              >
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Edit book">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => openEditModal(book)}
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete book">
              <span
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => openDeleteModal(book)}
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue?.toString();
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Books Library</h1>
        <Button
          color="primary"
          endContent={<PlusIcon />}
          onPress={() => {
            resetForm();
            onAddOpen();
          }}
        >
          Add New Book
        </Button>
      </div>

      <Table aria-label="Books library table">
        <TableHeader columns={columns}>
          {(column: { name: string; uid: string }) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={books} isLoading={loading}>
          {(item: Book) => (
            <TableRow key={item.id}>
              {(columnKey: React.Key) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Add Book Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} placement="top-center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Add New Book</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              label="Title"
              placeholder="Enter book title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <Input
              label="Author"
              placeholder="Enter author name"
              value={formData.author}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, author: e.target.value })
              }
            />
            <Input
              label="ISBN"
              placeholder="Enter ISBN (13 digits)"
              value={formData.isbn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, isbn: e.target.value })
              }
            />
            <Input
              type="number"
              label="Published Year"
              placeholder="Enter published year"
              value={formData.publishedYear?.toString() || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({
                  ...formData,
                  publishedYear: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={onAddClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreate}>
              Add Book
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Book Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} placement="top-center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Edit Book</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              label="Title"
              placeholder="Enter book title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <Input
              label="Author"
              placeholder="Enter author name"
              value={formData.author}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, author: e.target.value })
              }
            />
            <Input
              label="ISBN"
              placeholder="Enter ISBN (13 digits)"
              value={formData.isbn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, isbn: e.target.value })
              }
            />
            <Input
              type="number"
              label="Published Year"
              placeholder="Enter published year"
              value={formData.publishedYear?.toString() || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({
                  ...formData,
                  publishedYear: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={onEditClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleUpdate}>
              Update Book
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Book Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} placement="top-center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Book Details</ModalHeader>
          <ModalBody>
            {selectedBook && (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-small text-default-500">Title</p>
                  <p className="text-medium font-semibold">{selectedBook.title}</p>
                </div>
                <div>
                  <p className="text-small text-default-500">Author</p>
                  <p className="text-medium">{selectedBook.author}</p>
                </div>
                <div>
                  <p className="text-small text-default-500">ISBN</p>
                  <p className="text-medium font-mono">{selectedBook.isbn}</p>
                </div>
                <div>
                  <p className="text-small text-default-500">Published Year</p>
                  <p className="text-medium">{selectedBook.publishedYear || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-small text-default-500">Created At</p>
                  <p className="text-medium">{new Date(selectedBook.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-small text-default-500">Updated At</p>
                  <p className="text-medium">{new Date(selectedBook.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onViewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} placement="top-center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Delete Book</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete "<strong>{selectedBook?.title}</strong>"?
              This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}