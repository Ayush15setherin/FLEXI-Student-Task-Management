# FLEXI – Student Task Management & Records

React (Vite) + Node/Express + MongoDB (Mongoose)

## Run
1. Start MongoDB (open MongoDB Compass and connect to `mongodb://127.0.0.1:27017`).
2. Backend:   `cd backend && npm install && npm run dev`   (http://localhost:5000)
3. Frontend:  `cd frontend && npm install && npm run dev`  (http://localhost:5173)

The `flexi` database and its `students` / `tasks` collections are created automatically on first save – refresh Compass to see them.

## API
GET/POST `/api/students`, PUT/DELETE `/api/students/:id`
GET/POST `/api/tasks` (filters: `q`, `status`, `priority`, `student`), GET `/api/tasks/stats`, PUT/DELETE `/api/tasks/:id`
