# AI Quiz Microservices

An AI-powered quiz platform built as independent Spring Boot microservices. Questions can be generated on any topic by an LLM (Claude via OpenRouter), saved to the question bank, and accessed through a React-based interface. Demonstrates service discovery, an API gateway, inter-service communication via Feign, and a one-command Docker Compose setup.
 
## Features
 
- **AI question generation** — type a topic (e.g. "Java", "SQL"), get validated multiple-choice questions saved straight to the database
- **Explain with AI** — for any wrong answer, ask the AI to explain the correct one
- **Quiz flow** — create a quiz from a category, answer, submit, get a score computed by the backend
- **Timed mode**, **quiz history** and **stats** in the React UI
- **Docker Compose** — whole backend (5 services + Postgres) starts with one command
  
## Running with Docker (recommended)
 
**Prerequisites:** Docker Desktop, Node.js 18+, an [OpenRouter](https://openrouter.ai) API key.
 
**1. Clone the repo**
 
```bash
git clone https://github.com/Anjalii35/ai-quiz-microservices.git
cd ai-quiz-microservices
```
 
**2. Create a `.env` file in the project root**
 
```
DB_USERNAME=postgres
DB_PASSWORD=your_password
OPENROUTER_API_KEY=your_openrouter_key
```
 
**3. Start the backend** (Eureka, gateway, all services, Postgres)
 
```bash
docker compose up -d --build
```
 
Wait 4-5 minutes, then open `http://localhost:8761`. You should see `API-GATEWAY`, `QUESTION-SERVICE`, `QUIZ-SERVICE` and `JAVA-AI-AGENT` registered.
 
**4. Start the frontend**
 
```bash
cd frontend
npm install
npm start
```
 
Open `http://localhost:3000`, generate questions for a topic, then start a quiz.
 
**5. Stop everything**
 
```bash
docker compose down
```

## Architecture

```
                          ┌───────────────────┐
                          │   React Frontend  │   :3000
                          └─────────┬─────────┘
                                    │
                                    ▼
                          ┌────────────────────┐
                          │    API Gateway     │  :8765
                          │  routes requests   │
                          │  via Eureka lookup │
                          └─────────┬──────────┘
                                    │
        ┌───────────────────────────┼────────────────────────────┐
        ▼                           ▼                            ▼
┌───────────────┐         ┌───────────────────┐         ┌─────────────────┐
│  Quiz Service │◄───────►│  Question Service │◄───────►│  Java AI Agent  │
│  :8090        │  Feign  │  :8080            │  Feign  │  :8100          │
│  owns: Quiz + │  client |  owns: Question + |  client │  Claude via     │
|  quizdb       │         │  questiondb       │         │  OpenRouter     │
└───────────────┘         └───────────────────┘         └─────────────────┘
        ▲                           ▲                            ▲
        │                  all register with Eureka              │
        └───────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
                            ┌───────────────────┐
                            │  Service Registry │  :8761
                            │   (Eureka Server) │
                            └───────────────────┘
```

All services register themselves with the **Eureka service registry** on startup. The **API Gateway** is the single entry point — it looks up the target service by name in Eureka and routes the request there, so no service address is ever hardcoded. **Quiz Service** and **Java AI Agent** call **Question Service** through Feign clients that resolve the target via Eureka. Each business service owns its own Postgres database, with no shared schema.

## Services

| Service | Port | Responsibility |
|---|---|---|
| `service-registry` | 8761 | Eureka server — service discovery |
| `api-gateway` | 8765 | Single entry point, routes requests to the right service |
| `question-service` | 8080 (8081 in Docker) | Owns questions/answers and `questiondb` |
| `quiz-service` | 8090 | Owns quizzes and `quizdb`, coordinates with question-service |
| `java-ai-agent` | 8100 | Generates questions and explanations with an LLM, saves via question-service |
| `frontend` | 3000 | React UI |

## Tech stack

- Java 21, Spring Boot
- Spring Cloud Netflix Eureka, Spring Cloud Gateway, Spring Cloud OpenFeign
- Spring Data JPA + PostgreSQL
- LLM: Claude via OpenRouter (Anthropic Messages API format)
- React, Tailwind CSS
- Docker, Docker Compose, Maven

## AI flow — example
 
`POST /java-ai-agent/ai/generate` with `{ "category": "Java", "count": 5 }`:
 
1. Request goes through the **API Gateway** to `java-ai-agent`.
2. `AiQuizService` asks the LLM for `count` multiple-choice questions as JSON.
3. The response is parsed and **validated** (4 options, the right answer must be one of the options); invalid items are skipped.
4. Valid questions are saved through the Feign client to `question-service`.
5. The UI reloads the question bank, and the new questions are ready for a quiz.
`POST /java-ai-agent/ai/explain` with `{ question, yourAnswer, correctAnswer }` returns a short explanation.

## Notes
 
- The default model is `openrouter/free`; change `anthropic.model` in `java-ai-agent/src/main/resources/application.properties` to use a fixed model for more consistent output.
- Quiz history and stats are stored in the browser (localStorage), so no backend change was needed.
