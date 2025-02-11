FROM maven:3.9.9-eclipse-temurin-23-alpine AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests

FROM eclipse-temurin:23-jre-alpine AS final
WORKDIR /app
COPY --from=build /app/target/logi-*.jar logi-api.jar

ENV PORT 8080
EXPOSE 8080

# New Relic
COPY --from=build /app/newrelic/newrelic.jar newrelic.jar

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH

ENV SPRING_PROFILES_ACTIVE=production

ENTRYPOINT [ "sh", "-c", "java -javaagent:newrelic.jar -Dnewrelic.environment=${SPRING_PROFILES_ACTIVE} -Dnewrelic.config.file=/app/newrelic.yml -jar logi-api.jar" ]
