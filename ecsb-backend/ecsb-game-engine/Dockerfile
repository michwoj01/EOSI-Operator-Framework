FROM gradle:7-jdk11 AS build
COPY .. /home/gradle/ecsb-backend
WORKDIR /home/gradle/ecsb-backend
RUN gradle :ecsb-game-engine:buildFatJar --no-daemon

FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=build /home/gradle/ecsb-backend/ecsb-game-engine/build/libs/*.jar /app/ecsb-game-engine.jar
ENTRYPOINT ["java", "-jar", "/app/ecsb-game-engine.jar"]
