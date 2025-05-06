# Architecture Documentation

## Overview

This is a comprehensive healthcare management system built as a full-stack web application. It provides functionality for managing doctors, patients, appointments, prescriptions, medication schedules, and health metrics. The system supports multiple user roles including admin, doctor, patient, and pharmacist, each with specific capabilities.

The application follows a modern client-server architecture with a React frontend, Express.js backend, and PostgreSQL database. It leverages modern web technologies and libraries to create a responsive, accessible, and maintainable healthcare platform.

## System Architecture

### High-Level Architecture

The application follows a typical three-tier architecture:

1. **Presentation Layer** (Frontend)
   - React application with Shadcn UI components
   - TailwindCSS for styling
   - React Query for data fetching and state management
   - React Hook Form for form handling

2. **Application Layer** (Backend)
   - Express.js server
   - API endpoints for all application functionality
   - WebSocket support for real-time notifications
   - Service-oriented architecture with distinct service modules

3. **Data Layer**
   - PostgreSQL database (via Neon Serverless)
   - Drizzle ORM for database interactions
   - Data schema with relations handling core healthcare data models

### Key Design Decisions

- **Server-Side Rendering Approach**: The application uses a hybrid approach where the backend serves static assets but most interactions happen via API.
- **Database Schema Design**: The schema is designed around healthcare domain concepts with proper relationships between entities.
- **Real-time Communication**: WebSockets are used for notifications to provide immediate updates to users.
- **API Structure**: RESTful API design with clear resource-oriented endpoints.
- **Authentication**: Session-based authentication with role-based access control.

## Key Components

### Frontend Components

#### Pages
- **Authentication Pages**: Login/registration with role-based redirection
- **Dashboard Pages**: Specific dashboards for each user role (admin, doctor, patient)
- **Management Pages**: For managing appointments, prescriptions, patients, doctors, etc.

#### UI Components
- Shadcn UI component library (built on Radix UI primitives)
- Custom healthcare-specific components:
  - Appointment calendar and scheduler
  - Prescription management
  - Health metrics visualization
  - Medication schedule tracking

#### State Management
- React Query for server state
- React's Context API for client-side state (e.g., authentication state)
- Form state handled by React Hook Form

### Backend Components

#### API Routes
- Authentication routes (login, register, logout)
- User management routes (admin, doctor, patient, pharmacist)
- Clinical routes (appointments, prescriptions, health metrics)
- Reporting and analytics endpoints

#### Services
- **Notification Service**: Handles in-app and WebSocket notifications
- **Billing Service**: Manages billing for consultations and prescriptions
- **Prescription Service**: Handles prescription creation, verification, and management
- **Database Service**: Centralized database access layer

#### Middleware
- Authentication middleware
- Request logging
- Error handling

### Database Schema

The database schema is defined using Drizzle ORM and includes the following core tables:

- **users**: Base user information with role classification
- **doctors**: Doctor-specific information linked to users
- **patients**: Patient-specific information linked to users
- **appointments**: Scheduling between doctors and patients
- **prescriptions**: Medication prescriptions
- **health_metrics**: Patient health tracking data
- **medication_schedules**: Timing for medication intake

### WebSocket Integration

The system implements WebSockets via the `ws` library to provide real-time notifications for:
- New appointments
- Prescription updates
- Health alert notifications
- System announcements

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Backend validates credentials and establishes session
3. Frontend stores authentication token/session
4. Subsequent requests include authentication information
5. Role-based UI elements and routes are rendered based on user role

### Appointment Scheduling Flow
1. Patient requests appointment via scheduling interface
2. Backend validates availability and creates appointment record
3. Real-time notification sent to doctor via WebSocket
4. Email/notification sent to patient confirming appointment
5. Appointment appears in both doctor and patient dashboards

### Prescription Management Flow
1. Doctor creates prescription for patient
2. System validates for drug interactions and contraindications
3. Prescription is stored in database
4. Notification sent to patient
5. Medication schedules automatically generated
6. Billing record created if applicable

### Health Metrics Tracking Flow
1. Patient inputs health measurements (blood pressure, glucose, etc.)
2. Data stored and analyzed for concerning patterns
3. Visualizations presented to patient and relevant doctors
4. Alerts generated for out-of-range values
5. Health trends calculated and displayed

## External Dependencies

### Frontend Dependencies
- **@radix-ui components**: Accessible UI primitives
- **@tanstack/react-query**: Data fetching and caching
- **react-hook-form**: Form validation and handling
- **recharts**: Data visualization library
- **shadcn/ui**: Component library system
- **zod**: Schema validation
- **tailwindcss**: Utility-first CSS framework

### Backend Dependencies
- **express**: Web server framework
- **drizzle-orm**: Type-safe ORM
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **ws**: WebSocket library
- **zod**: Schema validation

### External Services
- **Neon Database**: Serverless PostgreSQL database

## Deployment Strategy

The application is configured for deployment on Replit with the following configuration:

1. **Build Process**
   - Vite for frontend bundling
   - esbuild for backend transpilation
   - Combined build process that outputs to `/dist` directory

2. **Environment Configuration**
   - Environment variables for database connections
   - Different configurations for development and production

3. **Startup Process**
   - Development: Runs with `tsx` for TypeScript execution
   - Production: Runs optimized Node.js bundle

4. **Resource Access**
   - Database connection via `DATABASE_URL` environment variable
   - Static assets served from `/dist/public` directory

5. **Scaling Considerations**
   - The application uses `autoscale` deployment target
   - Database is externalized with Neon's serverless Postgres

## Security Considerations

1. **Authentication**: Session-based with secure cookies
2. **Authorization**: Role-based access control for different user types
3. **Data Protection**: Input validation with Zod schemas
4. **API Security**: Proper error handling to prevent information leakage
5. **Database Security**: Parameterized queries via ORM to prevent SQL injection

## Maintenance and Extensibility

1. **Code Organization**: Clear separation of concerns with dedicated directories and files
2. **Module Structure**: Service-oriented backend with reusable components
3. **Type Safety**: TypeScript throughout the application
4. **Schema Evolution**: Drizzle migrations for database schema changes
5. **UI Component Library**: Consistent design system for easy UI extensions