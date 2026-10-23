\# Lab 06 — Task API



Express API using SQLite, Sequelize, input validation, Passport authentication, and Redis caching.



\## Requirements



\- Node.js and npm

\- Docker Desktop running with Linux containers



\## Installation



```powershell

npm ci

Copy-Item .env.example .env

```



Generate a session secret:



```powershell

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

```



Set the following values in `.env`, replacing the secret placeholder:



```dotenv

PORT=3000

SESSION\_SECRET=replace-with-your-generated-secret

REDIS\_URL=redis://localhost:6379

```



\## Start Redis



For the first run:



```powershell

docker run -d --name week7-redis -p 127.0.0.1:6379:6379 redis:7-alpine

```



For subsequent runs:



```powershell

docker start week7-redis

```



Verify Redis:



```powershell

docker exec week7-redis redis-cli ping

```



Expected response: `PONG`.



\## Run the API



```powershell

npm run dev

```



Alternatively:



```powershell

npm start

```



API address: http://localhost:3000



SQLite tables are created automatically at startup.



\## Routes



| Method | Path | Purpose |

|---|---|---|

| GET | /api/tasks/health | Health check |

| GET | /api/tasks | List tasks with Redis caching |

| GET | /api/tasks/:id | Retrieve one task |

| POST | /api/tasks | Create a task |

| PUT | /api/tasks/:id | Partially update a task |

| DELETE | /api/tasks/:id | Delete a task |

| POST | /api/auth/register | Register a user |

| POST | /api/auth/login | Log in and establish a session |

| GET | /api/auth/me | Retrieve the authenticated user |



Task CRUD routes are public in this lab. The profile route requires authentication.



\## Validation



\- Title: required for creation; 3–120 characters after trimming.

\- Completed: optional Boolean.

\- Priority: optional integer from 1 to 3.

\- PUT validates supplied fields and allows partial updates.

\- Invalid task input returns HTTP 400 with an error array.



\## Packages and purpose



| Package | Purpose |

|---|---|

| Express | Routing and middleware |

| Sequelize and sqlite3 | Models, persistence, and parameterized ORM queries |

| express-validator | Validate and sanitize request fields |

| Helmet | Defensive HTTP response headers |

| cors | Allow the configured frontend origin |

| express-rate-limit | Limit requests to 100 per 15 minutes per IP |

| compression | Compress suitable responses |

| Passport and passport-local | Authenticate users by email and password |

| bcrypt | Hash and verify passwords |

| express-session | Maintain login sessions |

| redis | Cache task lists |

| dotenv | Load local environment configuration |

| nodemon | Restart the development server after changes |



\## Caching



GET /api/tasks caches the task list under `tasks:all` for 60 seconds.



\- Cache miss: response source is `database`.

\- Cache hit: response source is `cache`.

\- Successful POST, PUT, and DELETE operations delete the collection cache.



Redis must be available before the API starts.



\## Local session configuration



Sessions use the default in-memory session store.

Cookies use httpOnly, SameSite=Lax, and secure=false for local HTTP testing.

Restarting the API clears login sessions.



For production, use a shared session store, HTTPS, secure cookies,

appropriate proxy configuration, and CSRF protection where required.



\## Observed test results



| Test | Observed result |

|---|---|

| Create, list, and retrieve task | Task returned successfully |

| Update task | completed changed to true |

| Delete task | HTTP 204 |

| Invalid task: title x, priority 99 | HTTP 400 with validation errors |

| Valid task | Task 2 created |

| Partial update | Task 2 completed changed to true |

| Profile before login | HTTP 401: Sign in required |

| Register | HTTP 201 with user ID and email |

| Login | HTTP 200 with email |

| Profile with session cookie | HTTP 200 with user ID and email |

| Redis connectivity | PONG |

| Consecutive task-list requests | database, then cache |

| Create task, then list | database source; new task 3 included |

| Health endpoint | HTTP 200; requests logged in server terminal |
| Helmet security header | X-Content-Type-Options: nosniff |
| Retrieve missing task | HTTP 404: Task not found |



\## Dependency audit



The recorded npm audit reported 5 vulnerabilities:

2 moderate and 3 high, involving dependency chains under Nodemon

and Sequelize.



The suggested force fixes proposed major-version downgrades.

No forced dependency changes were applied.



\## GitHub repository



https://github.com/nadilranasinghe/Lab06

