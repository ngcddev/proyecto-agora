# Agora — Electronic Voting System

Agora is a full-stack electronic voting platform developed as an academic project to demonstrate the integration of SOAP-based web services within a modern application stack. The system simulates a real electoral process, providing a public-facing interface, a voter ballot, and an administrative dashboard for election management.

The name Agora references the ancient Greek public space where citizens gathered to deliberate and vote on matters of collective concern.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Running the Application](#running-the-application)
- [SOAP Services](#soap-services)
- [REST API Reference](#rest-api-reference)
- [Application Features](#application-features)
- [Security Considerations](#security-considerations)
- [Development Guidelines](#development-guidelines)
- [Authors](#authors)

---

## Project Overview

Agora was built to explore the coexistence of legacy enterprise protocols (SOAP) with a contemporary JavaScript and Python stack. It provides:

- A public website with informational pages.
- A voter portal where registered citizens cast their vote after identity verification.
- An administrative dashboard for managing candidates, elections, and viewing real-time results.
- Two independent SOAP microservices written in Python that handle voter validation and official result auditing.

The system enforces a strict single-vote policy through two independent layers of protection: a database flag on the voter record and a unique constraint on the votes table.

---

## Architecture

```
Client (Browser)
      |
      | HTTP
      v
Vue 3 Frontend  (Vite, Vue Router, Pinia)
      |
      | REST / JSON  (Axios)
      v
Express / Node.js Backend  (REST API, JWT Auth, Multer)
      |           |
      |           | SOAP / XML  (Axios + xml2js)
      |           v
      |     Python Microservice  (Spyne, wsgiref, pymysql)
      |           |
      |           | SQL
      v           v
         MySQL 8  (Sequelize ORM)
```

The frontend never communicates with the SOAP services directly. The Express backend acts as a bridge: it receives REST requests from Vue, calls the appropriate SOAP operation internally, and returns clean JSON to the client. This design keeps the frontend decoupled from XML entirely.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Vue 3, Vite, Vue Router, Pinia | Reactive SPA with state management |
| Backend | Node.js, Express | REST API server |
| ORM | Sequelize | Database modeling and migrations |
| Database | MySQL 8 | Relational data persistence |
| SOAP Framework | Python, Spyne | SOAP service definition and exposure |
| SOAP Server | wsgiref.simple_server | Lightweight WSGI server for each service |
| DB Driver (Python) | pymysql | MySQL connectivity from Python |
| Authentication | JSON Web Tokens (JWT), bcryptjs | Admin session management |
| File Uploads | Multer | Candidate photo handling |
| XML Parsing | xml2js | SOAP response parsing in Node.js |
| HTTP Client | Axios | Internal SOAP requests from Express |

---

## Repository Structure

```
proyecto-agora/
|
|-- backend/                        Express REST API
|   |-- src/
|   |   |-- config/
|   |   |   `-- database.js         Sequelize connection
|   |   |-- controllers/
|   |   |   |-- authController.js
|   |   |   |-- candidatosController.js
|   |   |   |-- votantesController.js
|   |   |   |-- votosController.js
|   |   |   `-- eleccionesController.js
|   |   |-- middlewares/
|   |   |   |-- auth.js             JWT verification
|   |   |   `-- upload.js           Multer configuration
|   |   |-- models/
|   |   |   |-- index.js            Model registry and associations
|   |   |   |-- AdminUsuario.js
|   |   |   |-- Eleccion.js
|   |   |   |-- Candidato.js
|   |   |   |-- Votante.js
|   |   |   `-- Voto.js
|   |   |-- routes/
|   |   |   |-- index.js
|   |   |   |-- auth.js
|   |   |   |-- candidatos.js
|   |   |   |-- votantes.js
|   |   |   |-- votos.js
|   |   |   `-- elecciones.js
|   |   |-- seeders/
|   |   |   `-- seed.js             Development seed data
|   |   |-- services/
|   |   |   `-- soapClient.js       SOAP bridge (Node -> Python)
|   |   `-- app.js                  Express application entry point
|   |-- uploads/                    Candidate photo storage
|   |-- .env.example
|   `-- package.json
|
|-- frontend/                       Vue 3 SPA
|   |-- src/
|   |   |-- assets/
|   |   |   `-- main.css
|   |   |-- components/
|   |   |   `-- layout/
|   |   |       |-- Navbar.vue
|   |   |       `-- Footer.vue
|   |   |-- views/
|   |   |   |-- public/
|   |   |   |   |-- HomeView.vue
|   |   |   |   |-- AboutView.vue
|   |   |   |   |-- NewsView.vue
|   |   |   |   `-- TryNowView.vue
|   |   |   |-- voter/
|   |   |   |   `-- VoterView.vue
|   |   |   `-- admin/
|   |   |       |-- LoginView.vue
|   |   |       `-- DashboardView.vue
|   |   |-- stores/
|   |   |   |-- auth.js
|   |   |   |-- candidatos.js
|   |   |   `-- eleccion.js
|   |   |-- services/
|   |   |   `-- api.js              Axios instance with interceptors
|   |   |-- router/
|   |   |   `-- index.js
|   |   |-- App.vue
|   |   `-- main.js
|   |-- .env.example
|   `-- package.json
|
`-- soap-service/                   Python SOAP microservices
    |-- validador_votante.py        Service 1 — voter validation (port 8001)
    |-- resultados_oficiales.py     Service 2 — official results (port 8002)
    |-- requirements.txt
    `-- .env.example
```

---

## Prerequisites

The following tools must be installed before setting up the project:

| Tool | Minimum Version | Verification |
|---|---|---|
| Node.js | 20.x LTS | `node -v` |
| npm | 9.x | `npm -v` |
| Python | 3.10 | `python --version` |
| MySQL | 8.0 | `mysql --version` |
| Git | 2.x | `git --version` |

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/proyecto-agora.git
cd proyecto-agora
```

### 2. Backend dependencies

```bash
cd backend
npm install
```

### 3. Frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Python virtual environment and dependencies

```bash
cd ../soap-service
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

---

## Environment Variables

Each service requires its own `.env` file. Copy the provided examples and fill in the appropriate values.

### Backend — `backend/.env`

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=voto_electronico
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=a_long_random_secret_string

SOAP_VALIDADOR_URL=http://localhost:8001
SOAP_RESULTADOS_URL=http://localhost:8002

FRONTEND_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

### SOAP Service — `soap-service/.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=voto_electronico
PORT_VALIDADOR=8001
PORT_RESULTADOS=8002
```

---

## Database

### Create the database

```sql
CREATE DATABASE IF NOT EXISTS voto_electronico
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Run migrations and seed data

Sequelize synchronizes the schema automatically on server start. To populate the database with initial test data:

```bash
cd backend
npm run seed
```

This creates the following test records:

**Admin user**

| Field | Value |
|---|---|
| Email | admin@voto.com |
| Password | Admin1234! |
| Role | superadmin |

**Voters**

| Cedula | Name |
|---|---|
| 1001234567 | Juan Pablo Mora |
| 1007654321 | Laura Sanchez Ruiz |
| 1009876543 | Pedro Jimenez Castro |

**Candidates** — 3 candidates assigned to election ID 1.

**Election** — One active election titled "Elecciones Presidenciales 2025".

### Reset test data

To clear votes and re-enable voters for repeated testing:

```sql
DELETE FROM votos WHERE id > 0;
UPDATE votantes SET ya_voto = 0 WHERE id > 0;
```

---

## Running the Application

All four processes must run simultaneously. Open four terminal windows.

**Terminal 1 — Express backend**

```bash
cd backend
npm run dev
```

Server starts at `http://localhost:3000`. Verify with `http://localhost:3000/api/health`.

**Terminal 2 — SOAP Voter Validation Service**

```bash
cd soap-service
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS / Linux
python validador_votante.py
```

Service starts at `http://localhost:8001`. WSDL available at `http://localhost:8001/?wsdl`.

**Terminal 3 — SOAP Official Results Service**

```bash
cd soap-service
python resultados_oficiales.py
```

Service starts at `http://localhost:8002`. WSDL available at `http://localhost:8002/?wsdl`.

**Terminal 4 — Vue frontend**

```bash
cd frontend
npm run dev
```

Application available at `http://localhost:5173`.

---

## SOAP Services

### Service 1 — Voter Validation

**Endpoint:** `http://localhost:8001`
**WSDL:** `http://localhost:8001/?wsdl`
**Namespace:** `spyne.voto.validador`

This service is responsible for identity verification before granting access to the ballot. It is called by the Express backend before processing any vote.

#### Operations

**`validar_votante(cedula: String, eleccion_id: String) -> RespuestaValidacion`**

Verifies whether a voter is eligible to cast a vote in the specified election.

Response model `RespuestaValidacion`:

| Field | Type | Description |
|---|---|---|
| habilitado | Boolean | True if the voter may proceed |
| mensaje | String | Human-readable result description |
| nombre | String | Full name of the voter |
| cedula | String | The queried ID number |

Possible outcomes:

| Condition | habilitado | mensaje |
|---|---|---|
| Voter found, eligible | true | "Votante habilitado para votar" |
| Cedula not registered | false | "Cedula no registrada en el padron electoral" |
| Voter disabled | false | "Votante inhabilitado" |
| Already voted | false | "Este votante ya ejercio su voto" |

**`marcar_voto_emitido(cedula: String) -> String`**

Sets the `ya_voto` flag to true for the given voter, preventing further vote attempts.

---

### Service 2 — Official Results

**Endpoint:** `http://localhost:8002`
**WSDL:** `http://localhost:8002/?wsdl`
**Namespace:** `spyne.voto.resultados`

This service exposes election results in a structured, auditable SOAP format. It is intended for consumption by the administrative dashboard and by any external auditing system.

#### Operations

**`get_info_eleccion(eleccion_id: Integer) -> InfoEleccion`**

Returns general information about an election including its current status and total vote count.

| Field | Type | Description |
|---|---|---|
| eleccion_id | Integer | Election identifier |
| titulo | String | Election title |
| estado | String | pendiente, activa, or finalizada |
| total_votos | Integer | Total votes cast |

**`get_resultados_por_candidato(eleccion_id: Integer) -> Iterable(ResultadoCandidato)`**

Returns the vote count for each candidate, ordered from highest to lowest.

| Field | Type | Description |
|---|---|---|
| candidato_id | Integer | Candidate identifier |
| nombre | String | Full name |
| partido | String | Political party |
| numero | Integer | Ballot number |
| total_votos | Integer | Votes received |
| porcentaje | Float | Percentage of total votes |

**`get_ganador(eleccion_id: Integer) -> ResultadoCandidato`**

Returns a single `ResultadoCandidato` record for the candidate with the highest vote count.

---

### Testing SOAP services with Zeep

```python
import zeep

# Service 1 — Voter Validation
client = zeep.Client('http://localhost:8001/?wsdl')

result = client.service.validar_votante(
    cedula='1009876543',
    eleccion_id='1'
)
print(result.habilitado, result.nombre, result.mensaje)

# Service 2 — Official Results
client2 = zeep.Client('http://localhost:8002/?wsdl')

info = client2.service.get_info_eleccion(eleccion_id=1)
print(info.titulo, info.total_votos)

results = client2.service.get_resultados_por_candidato(eleccion_id=1)
for r in results:
    print(f"{r.nombre}: {r.total_votos} votes ({r.porcentaje}%)")

winner = client2.service.get_ganador(eleccion_id=1)
print(f"Winner: {winner.nombre}")
```

---

## REST API Reference

Base URL: `http://localhost:3000/api`

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /auth/login | Public | Returns JWT token |
| GET | /auth/me | Protected | Returns current admin user |

### Elections

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /elecciones/activa | Public | Get the currently active election |
| GET | /elecciones/:id | Public | Get election by ID |
| GET | /elecciones | Admin | List all elections |
| POST | /elecciones | Admin | Create election |
| PUT | /elecciones/:id | Admin | Update election |
| PUT | /elecciones/:id/activar | Admin | Set election as active |

### Candidates

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /candidatos | Public | List candidates (filter by eleccion_id) |
| GET | /candidatos/:id | Public | Get candidate by ID |
| GET | /candidatos/resultados/:eleccion_id | Public | Vote count per candidate |
| POST | /candidatos | Admin | Create candidate with photo |
| PUT | /candidatos/:id | Admin | Update candidate |
| DELETE | /candidatos/:id | Admin | Soft-delete candidate |

### Voters

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /votantes/validar | Public | Validate voter via SOAP Service 1 |
| GET | /votantes | Admin | List all voters |
| POST | /votantes | Admin | Register voter |
| PUT | /votantes/:id/habilitar | Admin | Toggle voter eligibility |

### Votes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /votos | Public | Cast a vote |
| GET | /votos/resultados/:eleccion_id | Public | Results via SOAP Service 2 |
| GET | /votos/stats/:eleccion_id | Admin | Dashboard statistics |

Protected routes require the header:
```
Authorization: Bearer <jwt_token>
```

---

## Application Features

### Public Website
- **Home** — Landing page with value proposition and feature highlights.
- **About Us** — Project description, technology stack, and team.
- **News** — Editorial section for project updates.
- **Try Now** — Registration form with email verification flow.

### Voter Portal (`/votar`)
1. Voter enters their national ID number.
2. The system calls SOAP Service 1 to verify eligibility.
3. If approved, the ballot is displayed with all active candidates.
4. The voter selects one candidate and submits.
5. A transaction records the vote and marks the voter as having participated.
6. A confirmation screen with a verification hash is shown.

### Administrative Dashboard (`/admin`)
- Secure login with JWT authentication.
- Overview panel with live statistics and a bar chart of results per candidate.
- Full CRUD for candidates including photo upload (JPEG, PNG, WEBP up to 2MB).
- Election management with activation control.

---

## Security Considerations

- Passwords are hashed with bcryptjs (12 salt rounds) before storage. Plain-text passwords are never persisted.
- JWT tokens expire after 8 hours. Expired tokens are rejected by the auth middleware.
- Votes are recorded inside a database transaction. If any step fails, the entire operation is rolled back.
- A unique constraint on `(votante_id, eleccion_id)` in the `votos` table prevents duplicate votes at the database level, independent of application logic.
- The `ya_voto` flag on the `votantes` table provides a fast first-pass check before the transaction is opened.
- File uploads are validated by MIME type and limited to 2MB.
- CORS is configured to allow requests only from the known frontend origin.

---

## Development Guidelines

### Commit conventions

This project follows the Conventional Commits specification:

```
type(scope): short description in present tense
```

| Type | When to use |
|---|---|
| feat | New functionality |
| fix | Bug correction |
| chore | Configuration, dependencies |
| refactor | Code improvement without behavior change |
| docs | Documentation only |
| style | Formatting, no logic change |

### Branch strategy

| Branch | Purpose |
|---|---|
| main | Stable, production-ready code only |
| develop | Active development |
| feat/name | Individual features |

Merge to `main` only when a feature is complete and tested.

### Resetting the development environment

```bash
# Clear all votes and re-enable voters
DELETE FROM votos WHERE id > 0;
UPDATE votantes SET ya_voto = 0 WHERE id > 0;

# Rebuild database from scratch
cd backend && npm run seed
```

---

## Authors

**Andres Casanova** — Full-Stack Developer

**Nicolas Ceron** — Full-Stack Developer

Academic project developed for the study of SOAP API integration within the MEVN stack (MySQL, Express, Vue, Node).
