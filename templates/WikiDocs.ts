/**
 * WikiDocs.ts - Documentation Integration System
 * 
 * Provides instant access to documentation for error-free coding
 */

export interface WikiDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  examples?: string[];
  related?: string[];
  tags: string[];
}

export const WIKI_DOCS: WikiDoc[] = [
  // JavaScript/TypeScript
  {
    id: 'js-arrays',
    title: 'JavaScript Arrays',
    category: 'javascript',
    content: 'Arrays are used to store multiple values in a single variable.',
    examples: [
      'const arr = [1, 2, 3];',
      'arr.push(4);',
      'arr.map(x => x * 2);',
      'arr.filter(x => x > 2);',
    ],
    related: ['js-objects', 'js-promises'],
    tags: ['array', 'javascript', 'collection'],
  },
  {
    id: 'js-promises',
    title: 'JavaScript Promises',
    category: 'javascript',
    content: 'Promise represents a value that may be available now, or in the future, or never.',
    examples: [
      'const promise = new Promise((resolve, reject) => {});',
      'promise.then(data => {}).catch(err => {});',
      'await promise;',
    ],
    related: ['js-async', 'js-arrays'],
    tags: ['promise', 'async', 'javascript'],
  },
  {
    id: 'ts-interfaces',
    title: 'TypeScript Interfaces',
    category: 'typescript',
    content: 'Interfaces define the structure of objects in TypeScript.',
    examples: [
      'interface User { id: number; name: string; email: string; }',
      'const user: User = { id: 1, name: "John", email: "john@example.com" };',
    ],
    related: ['ts-types', 'ts-generics'],
    tags: ['interface', 'typescript', 'types'],
  },
  {
    id: 'react-hooks',
    title: 'React Hooks',
    category: 'react',
    content: 'Hooks let you use state and other React features without writing a class.',
    examples: [
      'const [state, setState] = useState(initial);',
      'useEffect(() => {}, []);',
      'const value = useContext(Context);',
    ],
    related: ['react-components', 'react-state'],
    tags: ['react', 'hooks', 'state'],
  },
  {
    id: 'react-components',
    title: 'React Components',
    category: 'react',
    content: 'Components are reusable pieces of UI that can accept inputs (props) and return React elements.',
    examples: [
      'const Component = () => <div>Hello</div>;',
      'function Component({ title }) { return <div>{title}</div>; }',
    ],
    related: ['react-hooks', 'react-props'],
    tags: ['react', 'component', 'ui'],
  },
  // Python
  {
    id: 'py-lists',
    title: 'Python Lists',
    category: 'python',
    content: 'Lists are ordered, mutable collections in Python.',
    examples: [
      'my_list = [1, 2, 3]',
      'my_list.append(4)',
      '[x * 2 for x in my_list]',
    ],
    related: ['py-dicts', 'py-tuples'],
    tags: ['python', 'list', 'collection'],
  },
  {
    id: 'py-dicts',
    title: 'Python Dictionaries',
    category: 'python',
    content: 'Dictionaries store key-value pairs in Python.',
    examples: [
      'd = {"name": "John", "age": 30}',
      'd["name"]',
      'd.get("email", "default")',
    ],
    related: ['py-lists', 'py-sets'],
    tags: ['python', 'dict', 'mapping'],
  },
  {
    id: 'py-async',
    title: 'Python Async/Await',
    category: 'python',
    content: 'Async programming allows concurrent execution without threads.',
    examples: [
      'import asyncio',
      'async def main(): await asyncio.sleep(1)',
      'asyncio.run(main())',
    ],
    related: ['py-threading', 'py-concurrency'],
    tags: ['python', 'async', 'concurrency'],
  },
  // SQL
  {
    id: 'sql-select',
    title: 'SQL SELECT',
    category: 'sql',
    content: 'SELECT retrieves data from one or more tables.',
    examples: [
      'SELECT * FROM users;',
      'SELECT name, email FROM users WHERE id = 1;',
      'SELECT COUNT(*) FROM users;',
    ],
    related: ['sql-join', 'sql-where'],
    tags: ['sql', 'select', 'query'],
  },
  {
    id: 'sql-join',
    title: 'SQL JOIN',
    category: 'sql',
    content: 'JOIN combines rows from two or more tables based on a related column.',
    examples: [
      'SELECT * FROM users JOIN orders ON users.id = orders.user_id;',
      'SELECT * FROM users LEFT JOIN orders ON users.id = orders.user_id;',
    ],
    related: ['sql-select', 'sql-aggregation'],
    tags: ['sql', 'join', 'query'],
  },
  // REST API
  {
    id: 'rest-methods',
    title: 'REST API Methods',
    category: 'api',
    content: 'HTTP methods define the action to be performed on a resource.',
    examples: [
      'GET /users - retrieve users',
      'POST /users - create user',
      'PUT /users/1 - update user',
      'DELETE /users/1 - delete user',
    ],
    related: ['rest-status', 'rest-auth'],
    tags: ['api', 'rest', 'http'],
  },
  {
    id: 'rest-status',
    title: 'HTTP Status Codes',
    category: 'api',
    content: 'Status codes indicate the result of an HTTP request.',
    examples: [
      '200 OK - Success',
      '201 Created - Resource created',
      '400 Bad Request - Invalid input',
      '401 Unauthorized - Not authenticated',
      '404 Not Found - Resource not found',
      '500 Internal Server Error - Server error',
    ],
    related: ['rest-methods', 'rest-errors'],
    tags: ['api', 'http', 'status'],
  },
  // Docker
  {
    id: 'docker-basics',
    title: 'Docker Basics',
    category: 'docker',
    content: 'Docker is a platform for developing, shipping, and running applications in containers.',
    examples: [
      'docker build -t myapp .',
      'docker run -p 3000:3000 myapp',
      'docker-compose up -d',
    ],
    related: ['dockerfile', 'docker-compose'],
    tags: ['docker', 'container', 'devops'],
  },
  // Git
  {
    id: 'git-basics',
    title: 'Git Basics',
    category: 'git',
    content: 'Git is a distributed version control system.',
    examples: [
      'git init',
      'git add .',
      'git commit -m "message"',
      'git push origin main',
    ],
    related: ['git-branching', 'git-merge'],
    tags: ['git', 'version-control', 'vcs'],
  },
  // Security
  {
    id: 'security-headers',
    title: 'Security Headers',
    category: 'security',
    content: 'HTTP security headers help protect applications from common attacks.',
    examples: [
      'Content-Security-Policy: default-src \'self\'',
      'X-Frame-Options: DENY',
      'X-Content-Type-Options: nosniff',
      'Strict-Transport-Security: max-age=31536000',
    ],
    related: ['security-auth', 'security-cors'],
    tags: ['security', 'headers', 'http'],
  },
  // Testing
  {
    id: 'testing-jest',
    title: 'Jest Testing',
    category: 'testing',
    content: 'Jest is a JavaScript testing framework with a focus on simplicity.',
    examples: [
      'test("adds 1 + 2 to equal 3", () => { expect(1 + 2).toBe(3); });',
      'describe("math", () => { test("adds", () => {}); });',
      'beforeEach(() => {});',
    ],
    related: ['testing-mocking', 'testing-async'],
    tags: ['testing', 'jest', 'javascript'],
  },
];

// Search functions
export function searchWiki(query: string): WikiDoc[] {
  const q = query.toLowerCase();
  return WIKI_DOCS.filter(doc =>
    doc.title.toLowerCase().includes(q) ||
    doc.content.toLowerCase().includes(q) ||
    doc.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function getWikiDoc(id: string): WikiDoc | undefined {
  return WIKI_DOCS.find(doc => doc.id === id);
}

export function getWikiByCategory(category: string): WikiDoc[] {
  return WIKI_DOCS.filter(doc => doc.category === category);
}

export function getRelatedDocs(docId: string): WikiDoc[] {
  const doc = getWikiDoc(docId);
  if (!doc?.related) return [];
  return doc.related.map(id => getWikiDoc(id)).filter(Boolean) as WikiDoc[];
}

export function getAllCategories(): string[] {
  return [...new Set(WIKI_DOCS.map(doc => doc.category))];
}

export default WIKI_DOCS;