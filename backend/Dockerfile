FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -Dmaven.test.skip=true package

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl tzdata \
    && addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/logs && chown -R app:app /app
WORKDIR /app
COPY --from=build --chown=app:app /build/target/*.jar /app/app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
