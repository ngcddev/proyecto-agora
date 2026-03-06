# Agora — Sistema de Votación Electrónica

Agora es una plataforma de votación electrónica de pila completa desarrollada como proyecto académico para demostrar la integración de servicios web basados en SOAP dentro de un stack de aplicaciones moderno. El sistema simula un proceso electoral real, proporcionando una interfaz pública, una boleta de votación y un panel administrativo para la gestión de elecciones.

El nombre Agora hace referencia al espacio público de la antigua Grecia donde los ciudadanos se reunían para deliberar y votar sobre asuntos de interés colectivo.

---

## Tabla de Contenidos

- [Descripcion del Proyecto](#descripcion-del-proyecto)
- [Arquitectura](#arquitectura)
- [Stack Tecnologico](#stack-tecnologico)
- [Estructura del Repositorio](#estructura-del-repositorio)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion y Configuracion](#instalacion-y-configuracion)
- [Variables de Entorno](#variables-de-entorno)
- [Base de Datos](#base-de-datos)
- [Ejecucion de la Aplicacion](#ejecucion-de-la-aplicacion)
- [Servicios SOAP](#servicios-soap)
- [Referencia de la API REST](#referencia-de-la-api-rest)
- [Funcionalidades de la Aplicacion](#funcionalidades-de-la-aplicacion)
- [Consideraciones de Seguridad](#consideraciones-de-seguridad)
- [Guia de Desarrollo](#guia-de-desarrollo)
- [Autores](#autores)

---

## Descripcion del Proyecto

Agora fue construido para explorar la coexistencia de protocolos empresariales heredados (SOAP) con un stack contemporaneo de JavaScript y Python. El sistema provee:

- Un sitio web publico con paginas informativas.
- Un portal de votacion donde los ciudadanos registrados emiten su voto tras la verificacion de identidad.
- Un panel administrativo para gestionar candidatos, elecciones y visualizar resultados en tiempo real.
- Dos microservicios SOAP independientes escritos en Python que manejan la validacion de votantes y la auditoria oficial de resultados.

El sistema aplica una politica estricta de voto unico mediante dos capas de proteccion independientes: un indicador en el registro del votante y una restriccion de unicidad en la tabla de votos.

---

## Arquitectura

```
Cliente (Navegador)
      |
      | HTTP
      v
Frontend Vue 3  (Vite, Vue Router, Pinia)
      |
      | REST / JSON  (Axios)
      v
Backend Express / Node.js  (API REST, Auth JWT, Multer)
      |           |
      |           | SOAP / XML  (Axios + xml2js)
      |           v
      |     Microservicio Python  (Spyne, wsgiref, pymysql)
      |           |
      |           | SQL
      v           v
         MySQL 8  (ORM Sequelize)
```

El frontend nunca se comunica directamente con los servicios SOAP. El backend Express actua como puente: recibe peticiones REST desde Vue, invoca internamente la operacion SOAP correspondiente y devuelve JSON limpio al cliente. Este diseno mantiene el frontend completamente desacoplado de XML.

---

## Stack Tecnologico

| Capa | Tecnologia | Proposito |
|---|---|---|
| Frontend | Vue 3, Vite, Vue Router, Pinia | SPA reactiva con gestion de estado |
| Backend | Node.js, Express | Servidor de API REST |
| ORM | Sequelize | Modelado de base de datos y migraciones |
| Base de datos | MySQL 8 | Persistencia relacional de datos |
| Framework SOAP | Python, Spyne | Definicion y exposicion de servicios SOAP |
| Servidor SOAP | wsgiref.simple_server | Servidor WSGI ligero para cada servicio |
| Driver BD (Python) | pymysql | Conectividad MySQL desde Python |
| Autenticacion | JSON Web Tokens (JWT), bcryptjs | Gestion de sesion administrativa |
| Subida de archivos | Multer | Manejo de fotos de candidatos |
| Parseo XML | xml2js | Parseo de respuestas SOAP en Node.js |
| Cliente HTTP | Axios | Peticiones SOAP internas desde Express |

---

## Estructura del Repositorio

```
proyecto-agora/
|
|-- backend/                        API REST con Express
|   |-- src/
|   |   |-- config/
|   |   |   `-- database.js         Conexion Sequelize
|   |   |-- controllers/
|   |   |   |-- authController.js
|   |   |   |-- candidatosController.js
|   |   |   |-- votantesController.js
|   |   |   |-- votosController.js
|   |   |   `-- eleccionesController.js
|   |   |-- middlewares/
|   |   |   |-- auth.js             Verificacion JWT
|   |   |   `-- upload.js           Configuracion Multer
|   |   |-- models/
|   |   |   |-- index.js            Registro de modelos y asociaciones
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
|   |   |   `-- seed.js             Datos de prueba para desarrollo
|   |   |-- services/
|   |   |   `-- soapClient.js       Puente SOAP (Node -> Python)
|   |   `-- app.js                  Punto de entrada de Express
|   |-- uploads/                    Almacenamiento de fotos de candidatos
|   |-- .env.example
|   `-- package.json
|
|-- frontend/                       SPA Vue 3
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
|   |   |   `-- api.js              Instancia Axios con interceptores
|   |   |-- router/
|   |   |   `-- index.js
|   |   |-- App.vue
|   |   `-- main.js
|   |-- .env.example
|   `-- package.json
|
`-- soap-service/                   Microservicios SOAP en Python
    |-- validador_votante.py        Servicio 1 — validacion de votante (puerto 8001)
    |-- resultados_oficiales.py     Servicio 2 — resultados oficiales (puerto 8002)
    |-- requirements.txt
    `-- .env.example
```

---

## Requisitos Previos

Las siguientes herramientas deben estar instaladas antes de configurar el proyecto:

| Herramienta | Version minima | Verificacion |
|---|---|---|
| Node.js | 20.x LTS | `node -v` |
| npm | 9.x | `npm -v` |
| Python | 3.10 | `python --version` |
| MySQL | 8.0 | `mysql --version` |
| Git | 2.x | `git --version` |

---

## Instalacion y Configuracion

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/proyecto-agora.git
cd proyecto-agora
```

### 2. Dependencias del backend

```bash
cd backend
npm install
```

### 3. Dependencias del frontend

```bash
cd ../frontend
npm install
```

### 4. Entorno virtual Python y dependencias

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

## Variables de Entorno

Cada servicio requiere su propio archivo `.env`. Copia los ejemplos proporcionados y completa los valores correspondientes.

### Backend — `backend/.env`

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=voto_electronico
DB_USER=root
DB_PASSWORD=tu_password_mysql

JWT_SECRET=una_cadena_aleatoria_larga_y_segura

SOAP_VALIDADOR_URL=http://localhost:8001
SOAP_RESULTADOS_URL=http://localhost:8002

FRONTEND_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

### Servicio SOAP — `soap-service/.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=voto_electronico
PORT_VALIDADOR=8001
PORT_RESULTADOS=8002
```

---

## Base de Datos

### Crear la base de datos

```sql
CREATE DATABASE IF NOT EXISTS voto_electronico
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Ejecutar migraciones y datos de prueba

Sequelize sincroniza el esquema automaticamente al iniciar el servidor. Para poblar la base de datos con datos iniciales de prueba:

```bash
cd backend
npm run seed
```

Esto crea los siguientes registros de prueba:

**Usuario administrador**

| Campo | Valor |
|---|---|
| Email | admin@voto.com |
| Password | Admin1234! |
| Rol | superadmin |

**Votantes**

| Cedula | Nombre |
|---|---|
| 1001234567 | Juan Pablo Mora |
| 1007654321 | Laura Sanchez Ruiz |
| 1009876543 | Pedro Jimenez Castro |

**Candidatos** — 3 candidatos asignados a la eleccion con ID 1.

**Eleccion** — Una eleccion activa titulada "Elecciones Presidenciales 2025".

### Reiniciar datos de prueba

Para limpiar votos y rehabilitar votantes durante las pruebas:

```sql
DELETE FROM votos WHERE id > 0;
UPDATE votantes SET ya_voto = 0 WHERE id > 0;
```

---

## Ejecucion de la Aplicacion

Los cuatro procesos deben ejecutarse simultaneamente. Abrir cuatro terminales.

**Terminal 1 — Backend Express**

```bash
cd backend
npm run dev
```

El servidor inicia en `http://localhost:3000`. Verificar con `http://localhost:3000/api/health`.

**Terminal 2 — Servicio SOAP de Validacion de Votantes**

```bash
cd soap-service
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS / Linux
python validador_votante.py
```

Servicio disponible en `http://localhost:8001`. WSDL en `http://localhost:8001/?wsdl`.

**Terminal 3 — Servicio SOAP de Resultados Oficiales**

```bash
cd soap-service
python resultados_oficiales.py
```

Servicio disponible en `http://localhost:8002`. WSDL en `http://localhost:8002/?wsdl`.

**Terminal 4 — Frontend Vue**

```bash
cd frontend
npm run dev
```

Aplicacion disponible en `http://localhost:5173`.

---

## Servicios SOAP

### Servicio 1 — Validacion de Votante

**Endpoint:** `http://localhost:8001`
**WSDL:** `http://localhost:8001/?wsdl`
**Namespace:** `spyne.voto.validador`

Este servicio es responsable de la verificacion de identidad antes de otorgar acceso a la boleta electoral. Es invocado por el backend Express antes de procesar cualquier voto.

#### Operaciones

**`validar_votante(cedula: String, eleccion_id: String) -> RespuestaValidacion`**

Verifica si un votante es elegible para emitir su voto en la eleccion especificada.

Modelo de respuesta `RespuestaValidacion`:

| Campo | Tipo | Descripcion |
|---|---|---|
| habilitado | Boolean | Verdadero si el votante puede proceder |
| mensaje | String | Descripcion legible del resultado |
| nombre | String | Nombre completo del votante |
| cedula | String | Numero de cedula consultado |

Posibles resultados:

| Condicion | habilitado | mensaje |
|---|---|---|
| Votante encontrado y elegible | true | "Votante habilitado para votar" |
| Cedula no registrada | false | "Cedula no registrada en el padron electoral" |
| Votante inhabilitado | false | "Votante inhabilitado" |
| Ya emitio su voto | false | "Este votante ya ejercio su voto" |

**`marcar_voto_emitido(cedula: String) -> String`**

Establece el indicador `ya_voto` en verdadero para el votante indicado, impidiendo intentos de voto posteriores.

---

### Servicio 2 — Resultados Oficiales

**Endpoint:** `http://localhost:8002`
**WSDL:** `http://localhost:8002/?wsdl`
**Namespace:** `spyne.voto.resultados`

Este servicio expone los resultados de una eleccion en formato SOAP estructurado y auditable. Esta destinado al consumo por parte del panel administrativo y por cualquier sistema externo de auditoria.

#### Operaciones

**`get_info_eleccion(eleccion_id: Integer) -> InfoEleccion`**

Devuelve informacion general sobre una eleccion, incluyendo su estado actual y el total de votos emitidos.

| Campo | Tipo | Descripcion |
|---|---|---|
| eleccion_id | Integer | Identificador de la eleccion |
| titulo | String | Titulo de la eleccion |
| estado | String | pendiente, activa o finalizada |
| total_votos | Integer | Total de votos emitidos |

**`get_resultados_por_candidato(eleccion_id: Integer) -> Iterable(ResultadoCandidato)`**

Devuelve el conteo de votos por cada candidato, ordenados de mayor a menor.

| Campo | Tipo | Descripcion |
|---|---|---|
| candidato_id | Integer | Identificador del candidato |
| nombre | String | Nombre completo |
| partido | String | Partido politico |
| numero | Integer | Numero en la boleta |
| total_votos | Integer | Votos recibidos |
| porcentaje | Float | Porcentaje del total de votos |

**`get_ganador(eleccion_id: Integer) -> ResultadoCandidato`**

Devuelve un unico registro `ResultadoCandidato` correspondiente al candidato con mayor numero de votos.

---

### Prueba de servicios SOAP con Zeep

```python
import zeep

# Servicio 1 — Validacion de Votante
cliente1 = zeep.Client('http://localhost:8001/?wsdl')

resultado = cliente1.service.validar_votante(
    cedula='1009876543',
    eleccion_id='1'
)
print(resultado.habilitado, resultado.nombre, resultado.mensaje)

# Servicio 2 — Resultados Oficiales
cliente2 = zeep.Client('http://localhost:8002/?wsdl')

info = cliente2.service.get_info_eleccion(eleccion_id=1)
print(info.titulo, info.total_votos)

resultados = cliente2.service.get_resultados_por_candidato(eleccion_id=1)
for r in resultados:
    print(f"{r.nombre}: {r.total_votos} votos ({r.porcentaje}%)")

ganador = cliente2.service.get_ganador(eleccion_id=1)
print(f"Ganador: {ganador.nombre}")
```

---

## Referencia de la API REST

URL base: `http://localhost:3000/api`

### Autenticacion

| Metodo | Endpoint | Acceso | Descripcion |
|---|---|---|---|
| POST | /auth/login | Publico | Devuelve token JWT |
| GET | /auth/me | Protegido | Devuelve el administrador actual |

### Elecciones

| Metodo | Endpoint | Acceso | Descripcion |
|---|---|---|---|
| GET | /elecciones/activa | Publico | Obtener la eleccion activa actual |
| GET | /elecciones/:id | Publico | Obtener eleccion por ID |
| GET | /elecciones | Admin | Listar todas las elecciones |
| POST | /elecciones | Admin | Crear eleccion |
| PUT | /elecciones/:id | Admin | Actualizar eleccion |
| PUT | /elecciones/:id/activar | Admin | Establecer eleccion como activa |

### Candidatos

| Metodo | Endpoint | Acceso | Descripcion |
|---|---|---|---|
| GET | /candidatos | Publico | Listar candidatos (filtrar por eleccion_id) |
| GET | /candidatos/:id | Publico | Obtener candidato por ID |
| GET | /candidatos/resultados/:eleccion_id | Publico | Conteo de votos por candidato |
| POST | /candidatos | Admin | Crear candidato con foto |
| PUT | /candidatos/:id | Admin | Actualizar candidato |
| DELETE | /candidatos/:id | Admin | Eliminacion logica del candidato |

### Votantes

| Metodo | Endpoint | Acceso | Descripcion |
|---|---|---|---|
| POST | /votantes/validar | Publico | Validar votante via Servicio SOAP 1 |
| GET | /votantes | Admin | Listar todos los votantes |
| POST | /votantes | Admin | Registrar votante |
| PUT | /votantes/:id/habilitar | Admin | Alternar elegibilidad del votante |

### Votos

| Metodo | Endpoint | Acceso | Descripcion |
|---|---|---|---|
| POST | /votos | Publico | Emitir un voto |
| GET | /votos/resultados/:eleccion_id | Publico | Resultados via Servicio SOAP 2 |
| GET | /votos/stats/:eleccion_id | Admin | Estadisticas para el dashboard |

Las rutas protegidas requieren el encabezado:
```
Authorization: Bearer <token_jwt>
```

---

## Funcionalidades de la Aplicacion

### Sitio Web Publico
- **Inicio** — Pagina principal con propuesta de valor y destacados.
- **Nosotros** — Descripcion del proyecto, stack tecnologico y equipo.
- **Noticias** — Seccion editorial con actualizaciones del proyecto.
- **Pruebalo** — Formulario de registro con flujo de verificacion por correo electronico.

### Portal del Votante (`/votar`)
1. El votante ingresa su numero de cedula.
2. El sistema invoca el Servicio SOAP 1 para verificar elegibilidad.
3. Si es aprobado, se muestra la boleta con todos los candidatos activos.
4. El votante selecciona un candidato y confirma su voto.
5. Una transaccion registra el voto y marca al votante como participante.
6. Se muestra una pantalla de confirmacion con un hash de verificacion unico.

### Panel Administrativo (`/admin`)
- Inicio de sesion seguro con autenticacion JWT.
- Panel de resumen con estadisticas en tiempo real y grafica de barras de resultados por candidato.
- CRUD completo para candidatos incluyendo subida de foto (JPEG, PNG, WEBP hasta 2MB).
- Gestion de elecciones con control de activacion.

---

## Consideraciones de Seguridad

- Las contrasenas se hashean con bcryptjs (12 rondas de sal) antes de almacenarse. Las contrasenas en texto plano nunca se persisten.
- Los tokens JWT expiran tras 8 horas. Los tokens vencidos son rechazados por el middleware de autenticacion.
- Los votos se registran dentro de una transaccion de base de datos. Si cualquier paso falla, toda la operacion se revierte.
- Una restriccion de unicidad sobre `(votante_id, eleccion_id)` en la tabla `votos` impide votos duplicados a nivel de base de datos, de forma independiente a la logica de aplicacion.
- El indicador `ya_voto` en la tabla `votantes` proporciona una verificacion rapida de primera capa antes de abrir la transaccion.
- Las subidas de archivos se validan por tipo MIME y estan limitadas a 2MB.
- CORS esta configurado para aceptar solicitudes unicamente desde el origen conocido del frontend.

---

## Guia de Desarrollo

### Convencion de commits

Este proyecto sigue la especificacion Conventional Commits:

```
tipo(alcance): descripcion corta en presente
```

| Tipo | Cuando usarlo |
|---|---|
| feat | Nueva funcionalidad |
| fix | Correccion de error |
| chore | Configuracion, dependencias |
| refactor | Mejora de codigo sin cambio de comportamiento |
| docs | Solo documentacion |
| style | Formato, sin cambio de logica |

### Estrategia de ramas

| Rama | Proposito |
|---|---|
| main | Codigo estable, listo para produccion |
| develop | Desarrollo activo |
| feat/nombre | Funcionalidades individuales |

Fusionar a `main` unicamente cuando una funcionalidad este completa y probada.

### Reiniciar el entorno de desarrollo

```bash
# Limpiar todos los votos y rehabilitar votantes
DELETE FROM votos WHERE id > 0;
UPDATE votantes SET ya_voto = 0 WHERE id > 0;

# Reconstruir la base de datos desde cero
cd backend && npm run seed
```

---

## Autores

**Andres Casanova** — Desarrollador Full-Stack

**Nicolas Ceron** — Desarrollador Full-Stack

Proyecto academico desarrollado para el estudio de la integracion de APIs SOAP dentro del stack MEVN (MySQL, Express, Vue, Node).
