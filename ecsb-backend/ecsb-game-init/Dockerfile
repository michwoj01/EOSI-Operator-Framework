FROM gradle:7-jdk11 AS build
COPY ./../ /home/gradle/ecsb-backend
WORKDIR /home/gradle/ecsb-backend
RUN gradle :ecsb-game-init:buildFatJar --no-daemon

FROM openjdk:11-jre-slim
EXPOSE 2136
WORKDIR /app
RUN mkdir -p /app/assets
COPY --from=build /home/gradle/ecsb-backend/ecsb-game-init/build/libs/*.jar /app/ecsb-game-init.jar
ENTRYPOINT ["java", "-jar", "/app/ecsb-game-init.jar"]
