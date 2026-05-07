# BarberFlow

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-F7B93E?logo=jsonwebtokens&logoColor=black)

Plataforma web para la gestión integral de barberías. Digitaliza la agenda, los walk-ins y el flujo de clientes en tiempo real.

🔗 **Repositorio:** [github.com/acmuresan/BarberFlow](https://github.com/acmuresan/BarberFlow)

---

## ¿Qué es BarberFlow?

BarberFlow resuelve un problema real de las barberías tradicionales: la dependencia de la llamada telefónica como único canal de reserva, la falta de herramientas para gestionar la agenda y la ausencia de información en tiempo real sobre el flujo de clientes.

La aplicación ofrece tres perfiles de acceso con funciones diferenciadas:

- **Cliente** — reserva cita online eligiendo servicio, barbero, fecha y hora. Puede consultar su historial y cancelar citas pendientes.
- **Barbero (Trabajador)** — accede a su agenda del día, gestiona el estado de sus servicios y registra walk-ins (clientes sin cita previa).
- **Administrador** — control total del catálogo de servicios, la plantilla de barberos y todas las citas. Visualiza la actividad completa en tiempo real a través del panel de flujo en vivo.

Además, existe un **panel público** accesible sin login que muestra el total de personas en espera y el tiempo estimado, pensado para que cualquier cliente pueda consultarlo antes de ir.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular + TypeScript + Angular Material |
| Backend | Node.js + Express + TypeScript |
| Base de datos | MySQL 8 (utf8mb4) |
| Autenticación | JWT (JSON Web Tokens) + bcrypt |
| Email | Nodemailer (SMTP Gmail) |
| Control de versiones | Git + GitHub |
| Gestión del proyecto | Notion (Scrum Board) |

---

## Estructura del repositorio

```
BARBERFLOW/
├── backend/          → API REST (dominio de Alex)
├── frontend/         → Interfaz Angular (dominio de Marta)
├── logica/           → Documentación, diagramas y QA (dominio de Agus)
├── README.md         → Este archivo
└── LICENSE.md
```

Cada integrante trabaja exclusivamente en su carpeta. Cualquier modificación fuera del propio dominio requiere consenso previo del equipo.

---

## Equipo

| Nombre | Rol | Dominio |
|---|---|---|
| Alex Muresan | Backend Developer | `/backend/` |
| Marta Lozano | Frontend Developer | `/frontend/` |
| Agustín Pastor | Documentación y QA | `/logica/` |

**Tutor:** César Tejedor Moreno  
**Centro:** Técnico Superior en Desarrollo de Aplicaciones Web — a Distancia  
**Curso:** 2024–2026

---

## Instalación y arranque local

### Requisitos previos

- Node.js v20 o superior
- MySQL 8
- npm v9 o superior
- Angular CLI v17 o superior (para el frontend)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus credenciales de base de datos y JWT
npm run dev
```

El servidor arranca en `http://localhost:3000`.

### Base de datos

```bash
# Importa el esquema y los datos de prueba
mysql -u root -p barberflow < logica/base-de-datos/barberflow_schema.sql
mysql -u root -p barberflow < logica/base-de-datos/barberflow_seed.sql
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

La aplicación arranca en `http://localhost:4200`.

---

## Variables de entorno

El archivo `.env` nunca se sube al repositorio. Copia `.env.example` y rellena los valores:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=barberflow
JWT_SECRET=cambia_esto_por_un_secreto_seguro
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=BarberFlow <tu_email@gmail.com>
BARBERIA_DIRECCION=Calle Ejemplo 123, Ciudad
PANEL_POLLING_INTERVAL_MS=30000
```

---

## Endpoints principales de la API

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Pública | Registro de cliente |
| POST | `/api/auth/login` | Pública | Login → devuelve JWT |
| GET | `/api/barberos` | Pública | Lista de barberos activos |
| GET | `/api/servicios` | Pública | Catálogo de servicios |
| POST | `/api/citas` | JWT | Crear cita (valida solapamiento) |
| GET | `/api/citas/:usuario_id` | JWT | Historial de citas del cliente |
| PATCH | `/api/citas/:id/estado` | JWT + Admin | Cambiar estado; si "confirmada" → envía email |
| POST | `/api/walkins` | JWT + Admin/Barbero | Registrar walk-in |
| PATCH | `/api/walkins/:id/estado` | JWT + Admin/Barbero | Cambiar estado walk-in |
| GET | `/api/panel/hoy` | JWT + Admin/Barbero | Panel operativo en vivo |
| GET | `/api/panel/publico` | Pública | Total personas + tiempo estimado |

Formato de respuesta uniforme:

```json
{
  "success": true,
  "data": { ... }
}
```

---

## Funcionalidades principales

- **Reservas con validación anti-solapamiento** — el backend comprueba `fecha_hora` y `fecha_hora_fin` antes de insertar, devolviendo `409 Conflict` si el barbero ya tiene cita en ese tramo.
- **Tres roles diferenciados** — `admin`, `barbero` y `cliente`, con permisos controlados mediante middleware JWT y role middleware.
- **Panel de flujo en vivo** — citas activas, walk-ins en espera y tiempo estimado, actualizado cada 30 segundos en el frontend.
- **Panel público** — accesible sin autenticación, muestra total de personas y tiempo de espera estimado.
- **Walk-ins** — cola virtual de clientes sin cita, gestionada por barberos y administradores.
- **Notificaciones por email** — Nodemailer envía confirmación automática al cliente cuando el admin confirma la cita.
- **Soft-delete en barberos** — las bajas son lógicas (campo `activo`), preservando el historial completo de citas.

---

## Flujo de trabajo Git

| Rama | Responsable | Uso |
|---|---|---|
| `main` | Equipo | Solo código funcionando. Nunca se sube directamente. |
| `dev-backend` | Alex | Desarrollo del backend. |
| `dev-frontend` | Marta | Desarrollo del frontend. |
El código llega a `main` únicamente mediante Pull Request revisado por el equipo.

---

## Licencia

Proyecto académico — Trabajo de Fin de Grado DAW 2024–2026.
