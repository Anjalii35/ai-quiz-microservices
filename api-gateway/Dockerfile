# ---- Stage 1: build the jar ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -q package -DskipTests

# ---- Stage 2: run it (small image, no Maven) ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# service-registry 8761 | question-service 8080 | quiz-service 8090 | java-ai-agent 8100 | api-gateway 8765
ENTRYPOINT ["java", "-jar", "app.jar"]