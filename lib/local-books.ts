export type BookMode = "ai" | "original";
export type BookStatus = "writing" | "completed";

export type StoredChapter = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

export type StoredBook = {
  id: string;
  mode: BookMode;
  title: string;
  genre?: string;
  length?: string;
  style?: string;
  thought?: string;
  idea?: { label: string; title: string; summary: string; sample: string };
  outline?: { premise: string; tone: string; acts: Array<{ title: string; summary: string }> };
  status: BookStatus;
  chapters: StoredChapter[];
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "paper-realm-books";

export function createLocalId(prefix: string) {
  const value = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

export function loadBooks(): StoredBook[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const books = value ? JSON.parse(value) : [];
    return Array.isArray(books) ? books : [];
  } catch {
    return [];
  }
}

export function getBook(id: string) {
  return loadBooks().find((book) => book.id === id);
}

export function saveBook(book: StoredBook) {
  const books = loadBooks();
  const index = books.findIndex((item) => item.id === book.id);
  if (index === -1) books.unshift(book);
  else books[index] = book;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  return book;
}

export function bookWordCount(book: StoredBook) {
  return book.chapters.reduce((total, chapter) => total + chapter.content.length, 0);
}
