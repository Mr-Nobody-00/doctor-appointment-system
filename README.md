# Doctor Appointment System

A full-stack web application for managing doctor appointments with **Online (Teleconsultation)** and **Offline (In-Clinic)** consultation modes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Axios, React Router |
| Backend | Java 25, Spring Boot 4.0.5, Spring Data JPA, Hibernate |
| Security | JWT Authentication (jjwt), Spring Security |
| Database | H2 (In-Memory) |
| Build Tool | Maven |

## Prerequisites

Make sure you have the following installed:

- **Java 17+** → [Download](https://www.oracle.com/java/technologies/downloads/)
- **Node.js 18+** → [Download](https://nodejs.org/)
- **Git** → [Download](https://git-scm.com/)

Verify installation:
```bash
java -version
node -v
npm -v
git --version
```

## How to Run

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd demo
```

### Step 2: Start the Backend (Spring Boot)

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```

Wait until you see:
```
Started DemoApplication in X seconds
```

Backend runs on **http://localhost:8080**

### Step 3: Start the Frontend (React)

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

### Step 4: Open the Application

Open your browser and go to: **http://localhost:5173**

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Patient | Register a new account | Your password |

## Features

### Patient
- Register and Login
- Browse medical specialties
- Choose consultation mode (Online / Offline)
- Filter doctors by specialty and mode
- View available time slots
- Book appointments
- View appointment history
- Cancel appointments

### Admin
- Add medical specialties (Cardiology, Dermatology, etc.)
- Register doctors with mode (Online/Offline) and contact details
- Create time slots for doctors
- View all appointments by date
- Mark appointments as Completed or No-Show
- View daily summary statistics (by mode, specialty, status)

## API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new patient |
| POST | /api/auth/login | Login, returns JWT token |

### Specialties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/specialties | List all specialties |
| POST | /api/specialties | Add specialty (Admin) |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/doctors?specialtyId=1&mode=ONLINE | Filter doctors |
| GET | /api/doctors/all | List all doctors (Admin) |
| POST | /api/doctors | Add doctor (Admin) |

### Slots
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/slots?doctorId=1&date=2026-03-30 | Available slots |
| POST | /api/slots | Create slot (Admin) |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/appointments | Book appointment |
| GET | /api/appointments/my?email=x | My appointments |
| GET | /api/appointments/all?date=x | All appointments (Admin) |
| GET | /api/appointments/summary?date=x | Summary stats (Admin) |
| PUT | /api/appointments/{id}/cancel | Cancel appointment |
| PUT | /api/appointments/{id}/status | Update status (Admin) |

## Project Structure

```
demo/
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx       # Patient Dashboard
│   │   │   └── AdminDashboard.jsx  # Admin Panel
│   │   ├── App.jsx                 # Routes
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Styles
│   └── package.json
│
├── src/main/java/com/example/demo/
│   ├── model/                 # JPA Entities
│   │   ├── User.java
│   │   ├── Specialty.java
│   │   ├── Doctor.java
│   │   ├── Slot.java
│   │   └── Appointment.java
│   ├── repository/            # Data Access Layer
│   │   ├── UserRepository.java
│   │   ├── SpecialtyRepository.java
│   │   ├── DoctorRepository.java
│   │   ├── SlotRepository.java
│   │   └── AppointmentRepository.java
│   ├── controller/            # REST APIs
│   │   ├── AuthController.java
│   │   ├── SpecialtyController.java
│   │   ├── DoctorController.java
│   │   ├── SlotController.java
│   │   └── AppointmentController.java
│   ├── security/              # JWT Authentication
│   │   ├── JwtUtil.java
│   │   ├── JwtFilter.java
│   │   └── SecurityConfig.java
│   ├── WebConfig.java         # CORS Configuration
│   ├── DataSeeder.java        # Auto-creates Admin user
│   └── DemoApplication.java   # Main Application
│
├── src/main/resources/
│   └── application.properties # Database & Server Config
│
├── pom.xml                    # Maven Dependencies
└── README.md
```

## Architecture

```
React (5173) → Axios HTTP → Spring Boot (8080) → JPA → H2 Database
                                  ↑
                            JWT Security Filter
```

## Team

- **[Your Name]** — Full-stack Development, Backend APIs, JWT Auth, React Integration
- **[Name 2]** — Frontend Components, UI Design
- **[Name 3]** — UI Styling, Testing, Git Management
- **[Name 4]** — Documentation, Demo Preparation
