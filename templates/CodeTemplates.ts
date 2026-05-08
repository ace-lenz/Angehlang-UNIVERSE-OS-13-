/**
 * CodeTemplates.ts - Comprehensive Code Generation System
 * 
 * Zero-dependency, self-contained templates for all programming languages
 * Uses documentation (wiki) as the knowledge base to prevent errors
 */

export type TemplateCategory = 'app' | 'backend' | 'frontend' | 'api' | 'ui' | 'mobile' | 'database' | 'devops' | 'testing' | 'error-handling';

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  language: string;
  tags: string[];
  code: string;
  requires?: string[];
  wikiRef?: string;
}

export interface LanguageConfig {
  id: string;
  name: string;
  extensions: string[];
  compiler?: string;
  runtime?: string;
  lspConfig?: string;
}

// Zero-dependency language configurations
export const LANGUAGES: Record<string, LanguageConfig> = {
  javascript: { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.mjs'] },
  typescript: { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.mts'] },
  python: { id: 'python', name: 'Python', extensions: ['.py'] },
  rust: { id: 'rust', name: 'Rust', extensions: ['.rs'] },
  go: { id: 'go', name: 'Go', extensions: ['.go'] },
  java: { id: 'java', name: 'Java', extensions: ['.java'] },
  csharp: { id: 'csharp', name: 'C#', extensions: ['.cs'] },
  cpp: { id: 'cpp', name: 'C++', extensions: ['.cpp', '.cc', '.hpp'] },
  c: { id: 'c', name: 'C', extensions: ['.c', '.h'] },
  ruby: { id: 'ruby', name: 'Ruby', extensions: ['.rb'] },
  php: { id: 'php', name: 'PHP', extensions: ['.php'] },
  swift: { id: 'swift', name: 'Swift', extensions: ['.swift'] },
  kotlin: { id: 'kotlin', name: 'Kotlin', extensions: ['.kt'] },
  scala: { id: 'scala', name: 'Scala', extensions: ['.scala'] },
  html: { id: 'html', name: 'HTML', extensions: ['.html', '.htm'] },
  css: { id: 'css', name: 'CSS', extensions: ['.css'] },
  scss: { id: 'scss', name: 'SCSS', extensions: ['.scss'] },
  sql: { id: 'sql', name: 'SQL', extensions: ['.sql'] },
  graphql: { id: 'graphql', name: 'GraphQL', extensions: ['.graphql', '.gql'] },
  yaml: { id: 'yaml', name: 'YAML', extensions: ['.yaml', '.yml'] },
  json: { id: 'json', name: 'JSON', extensions: ['.json'] },
  markdown: { id: 'markdown', name: 'Markdown', extensions: ['.md'] },
  shell: { id: 'shell', name: 'Shell', extensions: ['.sh', '.bash'] },
  dockerfile: { id: 'dockerfile', name: 'Dockerfile', extensions: ['Dockerfile'] },
  terraform: { id: 'terraform', name: 'Terraform', extensions: ['.tf'] },
};

// Core templates - error-free by design
export const CODE_TEMPLATES: CodeTemplate[] = [
  // ============ FRONTEND TEMPLATES ============
  {
    id: 'react-ts-app',
    name: 'React TypeScript App',
    description: 'Modern React 18+ app with TypeScript, hooks, and best practices',
    category: 'frontend',
    language: 'typescript',
    tags: ['react', 'typescript', 'hooks', 'vite'],
    code: `import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

interface AppProps {
  title?: string;
}

export const App: React.FC<AppProps> = ({ title = 'App' }) => {
  const [state, setState] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Initialize app
        await Promise.resolve();
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAction = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.resolve();
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="app">
      <h1>{title}</h1>
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Processing...' : 'Click Me'}
      </button>
    </div>
  );
};

// Mount
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);`,
  },
  {
    id: 'vue-ts-app',
    name: 'Vue 3 TypeScript App',
    description: 'Vue 3 with Composition API and TypeScript',
    category: 'frontend',
    language: 'typescript',
    tags: ['vue', 'typescript', 'composition-api'],
    code: `<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Props {
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Vue App'
});

const state = ref<string>('');
const loading = ref<boolean>(false);
const error = ref<Error | null>(null);

const computedState = computed(() => state.value.toUpperCase());

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.resolve();
  } catch (e) {
    error.value = e as Error;
  } finally {
    loading.value = false;
  }
});

const handleAction = async () => {
  loading.value = true;
  try {
    await Promise.resolve();
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="app">
    <h1>{{ title }}</h1>
    <button @click="handleAction" :disabled="loading">
      {{ loading ? 'Processing...' : 'Click Me' }}
    </button>
  </div>
</template>`,
  },
  {
    id: 'html5-boilerplate',
    name: 'HTML5 Boilerplate',
    description: 'Semantic HTML5 with accessibility',
    category: 'frontend',
    language: 'html',
    tags: ['html', 'semantic', 'a11y'],
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Web Application">
  <title>Document</title>
</head>
<body>
  <header role="banner">
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="#main">Skip to main content</a></li>
      </ul>
    </nav>
  </header>
  <main id="main" role="main">
    <article>
      <h1>Heading</h1>
      <p>Content here</p>
    </article>
  </main>
  <footer role="contentinfo">
    <p>&copy; 2024</p>
  </footer>
</body>
</html>`,
  },
  {
    id: 'css-reset',
    name: 'Modern CSS Reset',
    description: 'Production-ready CSS reset with modern best practices',
    category: 'ui',
    language: 'css',
    tags: ['css', 'reset', 'modern'],
    code: `/* Modern CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  min-height: 100vh;
  line-height: 1.5;
  font-family: system-ui, -apple-system, sans-serif;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
  color: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

ul, ol {
  list-style: none;
}

button {
  background: none;
  border: none;
  cursor: pointer;
}`,
  },

  // ============ BACKEND TEMPLATES ============
  {
    id: 'express-ts-api',
    name: 'Express.js TypeScript API',
    description: 'RESTful API with Express, proper error handling',
    category: 'api',
    language: 'typescript',
    tags: ['express', 'api', 'rest', 'typescript'],
    code: `import express, { Request, Response, NextFunction } from 'express';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Types
interface Error {
  message: string;
  statusCode?: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Error handler
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err.message);
  const statusCode = err.statusCode || 500;
  const response: ApiResponse = {
    success: false,
    error: err.message,
    timestamp: new Date().toISOString()
  };
  res.status(statusCode).json(response);
};

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() },
    timestamp: new Date().toISOString()
  };
  res.json(response);
});

app.get('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await Promise.resolve([]);
    const response: ApiResponse = {
      success: true,
      data: users,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// Apply error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

export default app;`,
  },
  {
    id: 'fastapi-py',
    name: 'FastAPI Python',
    description: 'Modern Python API with Pydantic validation',
    category: 'backend',
    language: 'python',
    tags: ['fastapi', 'python', 'api', 'pydantic'],
    code: `from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

app = FastAPI(
    title="API",
    description="REST API",
    version="1.0.0"
)

# Models
class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# In-memory storage
users_db: List[User] = []

# Routes
@app.get("/")
async def root():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/users", response_model=List[User])
async def get_users():
    return users_db

@app.post("/api/users", response_model=User, status_code=201)
async def create_user(user: UserCreate):
    if any(u.email == user.email for u in users_db):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    new_user = User(
        id=len(users_db) + 1,
        email=user.email,
        name=user.name,
        created_at=datetime.utcnow()
    )
    users_db.append(new_user)
    return new_user

@app.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    user = next((u for u in users_db if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user`,
  },
  {
    id: 'rust-actix',
    name: 'Rust Actix Web',
    description: 'High-performance Rust API with Actix-web',
    category: 'backend',
    language: 'rust',
    tags: ['rust', 'actix', 'api'],
    code: `use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use chrono::Utc;

#[derive(Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize)]
pub struct User {
    pub id: u32,
    pub email: String,
    pub name: String,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
            timestamp: Utc::now().to_rfc3339(),
        }
    }
}

async fn health() -> impl Responder {
    HttpResponse::Ok().json(ApiResponse::success(()))
}

async fn get_users() -> impl Responder {
    let users: Vec<User> = vec![];
    HttpResponse::Ok().json(ApiResponse::success(users))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/health", web::get().to(health))
            .route("/api/users", web::get().to(get_users))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}`,
  },

  // ============ DATABASE TEMPLATES ============
  {
    id: 'postgresql-schema',
    name: 'PostgreSQL Schema',
    description: 'Production PostgreSQL schema with constraints',
    category: 'database',
    language: 'sql',
    tags: ['postgresql', 'schema', 'database'],
    code: `-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT users_email_check CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT users_name_length CHECK (
        LENGTH(name) >= 1 AND LENGTH(name) <= 100
    )
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT posts_title_length CHECK (
        LENGTH(title) >= 1 AND LENGTH(title) <= 255
    )
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published) WHERE published = TRUE;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT comments_content_length CHECK (
        LENGTH(content) >= 1 AND LENGTH(content) <= 2000
    )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();`,
  },
  {
    id: 'mongodb-schema',
    name: 'MongoDB Schema',
    description: 'MongoDB with proper indexing',
    category: 'database',
    language: 'javascript',
    tags: ['mongodb', 'mongoose', 'schema'],
    code: `// MongoDB schemas with proper indexing
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Invalid email']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: Date
}, {
  timestamps: true,
  optimisticConcurrency: true
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ deletedAt: 1 });

// Middleware
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 255
  },
  content: String,
  published: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

postSchema.index({ userId: 1, published: 1 });
postSchema.index({ published: 1 });

// Models
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

module.exports = { User, Post };`,
  },

  // ============ DEVOPS TEMPLATES ============
  {
    id: 'dockerfile-multi',
    name: 'Multi-stage Dockerfile',
    description: 'Optimized multi-stage build',
    category: 'devops',
    language: 'dockerfile',
    tags: ['docker', 'multi-stage', 'optimized'],
    code: `# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/health', (r)=>process.exit(r.statusCode===200?0:1))"

CMD ["node", "dist/index.js"]`,
  },
  {
    id: 'github-actions-ci',
    name: 'GitHub Actions CI',
    description: 'Modern CI pipeline',
    category: 'devops',
    language: 'yaml',
    tags: ['github', 'actions', 'ci', 'cd'],
    code: `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Test
        run: npm run test --coverage

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install and build
        run: |
          npm ci
          npm run build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist`,
  },

  // ============ TESTING TEMPLATES ============
  {
    id: 'vitest-react',
    name: 'Vitest React Test',
    description: 'Modern React testing with Vitest',
    category: 'testing',
    language: 'typescript',
    tags: ['vitest', 'react', 'testing', 'rtl'],
    code: `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    const { container } = renderWithRouter(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should display title', () => {
    renderWithRouter(<App title="Test App" />);
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('should handle button click', async () => {
    const handleClick = vi.fn();
    renderWithRouter(<App onAction={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle loading state', () => {
    renderWithRouter(<App loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const error = new Error('Test error');
    renderWithRouter(<App error={error} />);
    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });
});`,
  },

  // ============ ERROR HANDLING TEMPLATES ============
  {
    id: 'error-boundary',
    name: 'React Error Boundary',
    description: 'Production error boundary with fallback',
    category: 'error-handling',
    language: 'typescript',
    tags: ['react', 'error-boundary', 'error-handling'],
    code: `import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', color: '#dc2626' }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;`,
  },
  {
    id: 'try-catch-wrapper',
    name: 'Async Try-Catch Wrapper',
    description: 'Type-safe async error handler',
    category: 'error-handling',
    language: 'typescript',
    tags: ['error-handling', 'async', 'utility'],
    code: `interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as E };
  }
}

// Usage
const result = await tryCatch<User, ApiError>(
  fetchUserById(id)
);

if (result.success) {
  console.log('User:', result.data);
} else {
  console.error('Error:', result.error?.message);
}

// For sync functions
function safeExecute<T, E = Error>(
  fn: () => T,
  onError?: (error: E) => void
): Result<T, E> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    onError?.(error as E);
    return { success: false, error: error as E };
  }
}`,
  },

  // ============ MOBILE TEMPLATES ============
  {
    id: 'react-native-typescript',
    name: 'React Native TypeScript',
    description: 'React Native with TypeScript',
    category: 'mobile',
    language: 'typescript',
    tags: ['react-native', 'mobile', 'typescript'],
    code: `import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AppState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    users: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      // Simulated API call
      const users = await Promise.resolve<User[]>([]);
      setState(s => ({ ...s, users, loading: false }));
    } catch (e) {
      setState(s => ({ ...s, error: (e as Error).message, loading: false }));
    }
  };

  const renderItem = useCallback((user: User) => (
    <View key={user.id} style={styles.item}>
      <Text style={styles.itemTitle}>{user.name}</Text>
      <Text style={styles.itemSubtitle}>{user.email}</Text>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
      </View>
      
      {state.loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : state.error ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>{state.error}</Text>
          <TouchableOpacity onPress={loadUsers}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {state.users.map(renderItem)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, background: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  list: { flex: 1 },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  itemSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  error: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  errorText: { color: '#dc2626', fontSize: 16 },
  retryText: { color: '#3b82f6', fontSize: 16, marginTop: 8 },
});

export default App;`,
  },
];

// Template search and retrieval
export function getTemplate(id: string): CodeTemplate | undefined {
  return CODE_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): CodeTemplate[] {
  return CODE_TEMPLATES.filter(t => t.category === category);
}

export function getTemplatesByLanguage(language: string): CodeTemplate[] {
  return CODE_TEMPLATES.filter(t => t.language === language);
}

export function searchTemplates(query: string): CodeTemplate[] {
  const q = query.toLowerCase();
  return CODE_TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function getAllCategories(): TemplateCategory[] {
  return ['app', 'backend', 'frontend', 'api', 'ui', 'mobile', 'database', 'devops', 'testing', 'error-handling'];
}

export default CODE_TEMPLATES;