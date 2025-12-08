FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY . /app
RUN ./mvnw clean install -DskipTests
CMD ["./mvnw", "spring-boot:run"]

