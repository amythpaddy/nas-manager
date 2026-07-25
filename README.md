# 🚀 Smart NAS Manager

A high-performance, multi-user Network Attached Storage (NAS) management web application with **vector similarity AI content search**, built with **Spring Boot 3 (Backend)**, **Angular 18 (Frontend)**, and **PostgreSQL with pgvector (Database)**.

---

## 🌟 Key Features

1. **Multi-User Isolation & Role Access**: Separate home directories, storage quotas, and folder hierarchies per user.
2. **File & Folder Management**: Drag-and-drop file upload, folder creation, list & grid views, preview drawer for PDFs/images/text, file download.
3. **AI Ingestion & Semantic Vector Search**:
   - Automated background text extraction via **Apache Tika**.
   - Text chunking & local vector embeddings via **Ollama** (`nomic-embed-text` / `all-minilm`).
   - Vector storage & cosine similarity search directly inside **PostgreSQL using `pgvector`**.
   - Natural language search bar allowing users to find files by describing their contents (e.g. *"quarterly financial report"*).
4. **File & Folder Sharing**: Share files/folders with specific users or generate public share links with expiration.
5. **Local System Storage**: Files stored under `~/.data/storage/<user_id>/` on the host filesystem.
6. **Mobile App Ready**: Fully decoupled REST API designed with JWT access & refresh tokens.

---

## 📂 Monorepo Repository Architecture

```
nas-manager/
├── backend/                # Spring Boot 3.3 (Java 21) REST Service
│   ├── src/main/java/com/nasmanager/
│   │   ├── controller/     # AuthController, FileController, FolderController, ShareController, SearchController
│   │   ├── dto/            # Data transfer objects
│   │   ├── model/          # User, Folder, FileItem, FileShare, FileEmbedding entities
│   │   ├── repository/     # JPA + Native pgvector search repositories
│   │   ├── security/       # Spring Security, JWT Provider & Filter
│   │   └── service/        # Storage, Ingestion, Tika Text Extractor, Ollama Vector Embedding
│   └── pom.xml
├── frontend/               # Angular 18 Single Page Application
│   ├── src/app/
│   │   ├── components/     # Auth, Navbar, Sidebar, File Explorer, Share & Preview Modals
│   │   ├── services/       # Auth, File, Folder, Share, Search Services
│   │   ├── guards/         # Auth Guard
│   │   └── interceptors/   # JWT Bearer Token Interceptor
│   └── src/styles.css      # Custom Glassmorphism Design System & Design Tokens
├── docker-compose.yml      # Infrastructure (PostgreSQL + pgvector, Ollama AI, Apache Tika)
└── README.md
```

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- Docker & Docker Compose
- Java 21+ & Maven 3.9+
- Node.js (v18+) & npm

### 1. Start Infrastructure Services (PostgreSQL + pgvector, Ollama, Tika)
```bash
docker-compose up -d
```

Pull the local embedding model in Ollama:
```bash
docker exec -it nas_ollama ollama pull nomic-embed-text
```

### 2. Run Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080` with Swagger UI at `http://localhost:8080/swagger-ui.html`.*

### 3. Run Angular Frontend
```bash
cd frontend
npm install
npm start
```
*Frontend app runs on `http://localhost:4200`.*

---

## 🔐 API Reference Highlights

- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate & obtain JWT tokens
- `POST /api/files/upload` - Upload file (triggers async Tika + Ollama vector indexing)
- `GET /api/files` - List user files in current folder
- `GET /api/search?q={query}` - Semantic vector similarity search over file content
- `POST /api/shares` - Share file with user or create public URL
