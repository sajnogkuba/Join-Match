FROM openjdk:17-alpine
WORKDIR /app
COPY . /app
RUN ./mvnw clean install -DskipTests
CMD ["./mvnw", "spring-boot:run"]

