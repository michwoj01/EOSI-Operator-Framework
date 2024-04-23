FROM gradle:7-jdk11 AS build
COPY ./../ /home/gradle/ecsb-backend
WORKDIR /home/gradle/ecsb-backend
RUN gradle buildFatJar --no-daemon

FROM openjdk:11
EXPOSE 2136:2136
WORKDIR /home/gradle/ecsb-backend
RUN mkdir /app
COPY --from=build /home/gradle/ecsb-backend/ecsb-game-init/build/libs/*.jar /app/ecsb-game-init.jar
ENTRYPOINT ["java", "-jar", "/app/ecsb-game-init.jar"]
