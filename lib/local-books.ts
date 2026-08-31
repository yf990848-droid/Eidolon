export type BookMode = "ai" | "original";
export type BookStatus = "writing" | "completed";

export type StoredChapter = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

export type StoredChapterOutline = {
  title: string;
  goal: string;
  events: string;
  turn: string;
  foreshadow: string;
  hook: string;
};

export type StoredBook = {
  id: string;
  mode: BookMode;
  title: string;
  genre?: string;
  length?: string;
  style?: string;
  styleId?: string;
  styleInstruction?: string;
  thought?: string;
  idea?: { label: string; title: string; summary: string; sample: string };
  outline?: { premise: string; tone: string; acts: Array<{ title: string; summary: string }> };
  chapterCount?: number;
  chapterOutlines?: StoredChapterOutline[];
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

export type BookDownloadFormat = "txt" | "md";

function safeFileName(title: string) {
  return title.replace(/[\\/:*?"<>|]/g, "-").trim() || "未命名作品";
}

function renderBook(book: StoredBook, format: BookDownloadFormat) {
  const status = book.status === "completed" ? "已完成" : "创作中";
  const divider = "=".repeat(32);
  if (format === "md") {
    const chapters = book.chapters.map((chapter) => `## ${chapter.title}\n\n${chapter.content}`).join("\n\n---\n\n");
    return `# ${book.title}\n\n- 状态：${status}\n- 章节：${book.chapters.length}\n- 字数：${bookWordCount(book)}\n\n${chapters}\n`;
  }

  const chapters = book.chapters.map((chapter) => `${chapter.title}\n\n${chapter.content}`).join(`\n\n${divider}\n\n`);
  return `${book.title}\n\n状态：${status}\n章节：${book.chapters.length}\n字数：${bookWordCount(book)}\n\n${divider}\n\n${chapters}\n`;
}

export function downloadBook(book: StoredBook, format: BookDownloadFormat) {
  const content = renderBook(book, format);
  const blob = new Blob([format === "txt" ? `\uFEFF${content}` : content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName(book.title)}.${format}`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
