FROM gradle:7-jdk11 AS build
COPY .. /home/gradle/ecsb-backend
WORKDIR /home/gradle/ecsb-backend
RUN gradle :ecsb-moving:buildFatJar --no-daemon

FROM openjdk:11
EXPOSE 8085
WORKDIR /app
COPY --from=build /home/gradle/ecsb-backend/ecsb-moving/build/libs/*.jar /app/ecsb-moving.jar
ENTRYPOINT ["java", "-jar", "/app/ecsb-moving.jar"]
