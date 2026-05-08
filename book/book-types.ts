import { BookContent } from '@/types';

export const DEFAULT_BOOK_DATA: BookContent = {
  id: "default-book",
  title: "Sovereign OS Manual",
  author: "Sovereign AI",
  pages: [
    { id: "page-1", title: "Introduction", content: "Welcome to the future of compute.", elements: [] }
  ]
};
