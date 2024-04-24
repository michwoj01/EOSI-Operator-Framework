FROM gradle:7-jdk11 AS build
COPY .. /home/gradle/ecsb-backend
WORKDIR /home/gradle/ecsb-backend
RUN gradle :ecsb-chat:buildFatJar --no-daemon

FROM openjdk:11
EXPOSE 2138:2138
WORKDIR /home/gradle/ecsb-backend
RUN mkdir /app
COPY --from=build /home/gradle/ecsb-backend/ecsb-chat/build/libs/*.jar /app/ecsb-chat.jar
ENTRYPOINT ["java", "-jar", "/app/ecsb-chat.jar"]
