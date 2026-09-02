# Quiz App — Spring Boot Microservices

A quiz application built as four independent Spring Boot services, demonstrating service discovery, an API gateway, and inter-service communication via Feign — rather than a single monolithic app.

## Architecture

```
                     ┌───────────────────┐
                     │  Client (browser  │
                     │   / Postman)      │
                     └─────────┬─────────┘
                               │
                               ▼
                     ┌───────────────────┐
                     │   API Gateway      │  :8765
                     │  routes requests   │
                     │  via Eureka lookup │
                     └─────────┬─────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐         ┌──────────────────┐
        │  Quiz Service    │◄───────►│ Question Service │
        │  :8090           │  Feign  │                  │
        │  owns: Quiz +    │  client │ owns: Question + │
        │  quizdb          │         │ questiondb       │
        └─────────────────┘         └──────────────────┘
                 ▲                           ▲
                 │       registers with      │
                 └─────────────┬─────────────┘
                               ▼
                     ┌───────────────────┐
                     │  Service Registry  │  :8761
                     │   (Eureka Server)  │
                     └───────────────────┘
```

All four services register themselves with the **Eureka service registry** on startup. The **API Gateway** is the single entry point — it looks up the target service by name in Eureka and routes the request there, so no service address is ever hardcoded. **Quiz Service** owns quiz composition and scoring; when it needs actual question data, it calls **Question Service** through a Feign client, which itself resolves the target instance via Eureka. Each business service (question-service, quiz-service) owns its own Postgres database — there's no shared schema between them.

## Services

| Service | Port | Responsibility |
|---|---|---|
| `service-registry` | 8761 | Eureka server — service discovery |
| `api-gateway` | 8765 | Single entry point, routes requests to the right service |
| `question-service` | 8080 | Owns questions/answers and `questiondb` |
| `quiz-service` | 8090 | Owns quizzes and `quizdb`, coordinates with question-service |

## Tech stack

- Java 21, Spring Boot
- Spring Cloud Netflix Eureka (service discovery)
- Spring Cloud Gateway (API gateway, discovery-locator routing)
- Spring Cloud OpenFeign (inter-service HTTP calls)
- Spring Data JPA + PostgreSQL
- Maven

## Request flow — example

`GET /quiz-service/quiz/get/{id}` (fetch questions for a quiz):

1. Client sends the request to the **API Gateway**.
2. Gateway resolves `quiz-service` via Eureka and forwards the request.
3. `QuizController` loads the `Quiz` row (with its list of question IDs) from `quizdb`.
4. `QuizService` calls `question-service` through the Feign client, which resolves `QUESTION-SERVICE` via Eureka and makes the actual HTTP call.
5. `question-service` fetches the questions and returns them as `QuestionWrapper` objects — with the correct answer stripped out, since this response goes to the client.
6. The response flows back through the same chain to the client.

## Running locally

**Prerequisites:** Java 21, Maven, PostgreSQL running locally with two databases created (`questiondb`, `quizdb`).

**1. Set environment variables** (each service reads DB credentials from the environment, not hardcoded values):

```
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
```

**2. Start the services in this order** (each in its own terminal, from inside its folder):

```bash
# 1. Registry first — everything else depends on it being up
cd service-registry
./mvnw spring-boot:run

# 2. Then the business services (any order)
cd question-service
./mvnw spring-boot:run

cd quiz-service
./mvnw spring-boot:run

# 3. Gateway last
cd api-gateway
./mvnw spring-boot:run
```

**3. Check the Eureka dashboard** at `http://localhost:8761` — you should see all four services registered (`API-GATEWAY`, `QUESTION-SERVICE`, `QUIZ-SERVICE`) after they finish starting.

**4. Hit the app** through the gateway, e.g.:

```
POST http://localhost:8765/quiz-service/quiz/create
GET  http://localhost:8765/quiz-service/quiz/get/{id}
POST http://localhost:8765/quiz-service/quiz/submit/{id}
```

## Notes

This project was built to learn the core microservices patterns — service discovery, an API gateway, and typed inter-service calls via Feign — as a stepping stone before designing a fresh microservices project from scratch.
