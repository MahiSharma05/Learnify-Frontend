# Learnify Frontend — Angular 17

Full-stack LMS frontend with JWT auth, role-based access, and complete UI for Student/Instructor/Admin.

## Quick Start

```bash
npm install
npm start          # Opens http://localhost:4200
```

## Backend Required (all must be running)

| Service       | Port |
|--------------|------|
| API Gateway   | 8080 |
| Auth          | 8081 |
| Course        | 8082 |
| Lesson        | 8083 |
| Enrollment    | 8084 |
| Assessment    | 8085 |
| Payment       | 8086 |
| Progress      | 8087 |
| Discussion    | 8088 |
| Notification  | 8089 |

## Configuration

Edit `src/environments/environment.ts` to change the API Gateway URL.

## Roles

- **Student**: Browse/enroll courses, watch lessons, take quizzes, earn certificates
- **Instructor**: Create/manage courses, lessons, quizzes, view student progress  
- **Admin**: Full platform management, user control, analytics

## Google OAuth2

Set `googleOAuthClientId` in `environment.ts` and configure Spring Boot accordingly.  
Backend must redirect to: `http://localhost:4200/auth/oauth2/callback?token=...`

## Build

```bash
npm run build          # Development build
npm run build:prod     # Production build
```
# Learnify-Frontend
