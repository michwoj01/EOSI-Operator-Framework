FROM gradle:7-jdk11 AS build
COPY .. /home/gradle/ecsb-backend
WORKDIR /home/gradle/ecsb-backend
RUN gradle :ecsb-timer:buildFatJar --no-daemon

FROM openjdk:11
WORKDIR /home/gradle/ecsb-backend
RUN mkdir /app
COPY --from=build /home/gradle/ecsb-backend/ecsb-timer/build/libs/*.jar /app/ecsb-timer.jar
ENTRYPOINT ["java", "-jar", "/app/ecsb-timer.jar"]
