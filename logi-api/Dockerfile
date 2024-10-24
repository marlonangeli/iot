FROM maven:3.9.9-eclipse-temurin-23-alpine AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests

FROM eclipse-temurin:23-jre-alpine AS final
WORKDIR /app
COPY --from=build /app/target/logi-*.jar logi-api.jar
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "logi-api.jar"]
