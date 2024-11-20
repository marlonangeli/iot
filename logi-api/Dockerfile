FROM maven:3.9.9-eclipse-temurin-23-alpine AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests

FROM eclipse-temurin:23-jre-alpine AS final
WORKDIR /app
COPY --from=build /app/target/logi-*.jar logi-api.jar
EXPOSE 8080

# New Relic
COPY --from=build /app/newrelic/newrelic.jar newrelic.jar
COPY --from=build /app/newrelic/newrelic.yml newrelic.yml
ARG NEW_RELIC_LICENSE_KEY
ENV NEW_RELIC_LICENSE_KEY=$NEW_RELIC_LICENSE_KEY
RUN sed -i "s/license_key: .*/license_key: '${NEW_RELIC_LICENSE_KEY}'/" newrelic.yml

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH

ENTRYPOINT ["java", "-javaagent:newrelic.jar", "-jar", "logi-api.jar"]
