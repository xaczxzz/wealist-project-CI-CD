package OrangeCloud.UserRepo.config;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    // Java 8 Date/Time 객체(LocalDateTime 등) 직렬화를 위한 모듈을 명시적으로 등록
    @Bean
    public JavaTimeModule javaTimeModule() {
        return new JavaTimeModule();
    }
}