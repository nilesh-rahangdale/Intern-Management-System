FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests dependency:go-offline

COPY src src

RUN ./mvnw -q -DskipTests package \
    && JAR_FILE=$(ls target/*.jar | grep -v 'original' | head -n 1) \
    && cp "$JAR_FILE" target/app.jar

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

RUN useradd -r -u 1001 spring \
    && mkdir -p /app/ServerStorage/certificates /app/ServerStorage/rootca \
    && chown -R spring:spring /app

COPY --from=builder /workspace/target/app.jar /app/app.jar

USER spring

EXPOSE 8080

ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
