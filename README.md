## Team Members
| Name            | Roll Number |
| --------------- | ----------- |
| Kashish Goyal   | 2210990496  |
| Aastha          | 2210991128  |
| Chaitanya Verma | 22109901453 |


## Project Title
LearningLog - Smart Learning and Communication System

## Type
Code Copyright

## Team Details
We are a team of final-year Computer Science students working collaboratively on a full-stack application. The project involves backend development, frontend design, database management, and implementation of real-time and AI-based features.

## Current Status
The project is fully functional with all major features implemented, including authentication, role-based access, learning logs, analytics dashboard, chatbot integration, and real-time communication. The system has been tested and is ready for further deployment.

## Project Description
A full-stack platform that combines daily logs, role-based access, and tracking. It includes chatbot support, real-time updates, and shared logs, improving learning, transparency, and accountability.

## Features
- Secure authentication using JWT  
- Role-based access (Admin / User)  
- Daily learning log (Add, Edit, View)  
- Analytics dashboard for progress tracking  
- Calendar view for logs  
- Reminder system (6 PM notification)  
- Real-time chat using WebSocket  
- AI Chatbot for quick help  
- View logs shared by other users  
- Admin dashboard (monitor users, activity, stats)  
- Edit history tracking for logs  

## Tech Stack

### Backend
- Java  
- Spring Boot  
- Spring Security (JWT)  
- WebSocket  
- Spring AI  

### Frontend
- React.js  
- Axios  
- Context API  

### Database
- MySQL  

---

## Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Kashishgoyal6300/LearningLog.git
cd LearningLog
```

### 2. Backend Setup (Spring Boot)

1. Open backend folder in your IDE (IntelliJ / VS Code)

2. Configure database in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/learning_log
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

3. Run the Spring Boot application:

```bash
mvn spring-boot:run
```

Backend will run on:
```
http://localhost:8080
```

---

### 3. Frontend Setup (React)

1. Go to frontend folder:
```bash
cd learning-log-frontend-main
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend:
```bash
npm run dev
```

Frontend will run on:
```
http://localhost:5173
```

---

## Authentication Flow
- User logs in → JWT token generated  
- Token stored in frontend (via Axios interceptors)  
- All API requests are secured using JWT  

## Chat System
- Built using WebSocket  
- Enables real-time communication between users and admin  
- Supports message updates without refreshing  

## Chatbot (Spring AI)
- Integrated AI chatbot for answering queries  
- Helps users without needing admin support  
- Provides quick and professional responses  

## Reminder System
- Sends notification at 6 PM  
- Triggered if user has not submitted daily log  
- Helps maintain consistency  

## Admin Capabilities
- View total users  
- Track daily activity  
- Identify users who missed logs  
- Manage roles (Admin/User)  
- Monitor engagement  
