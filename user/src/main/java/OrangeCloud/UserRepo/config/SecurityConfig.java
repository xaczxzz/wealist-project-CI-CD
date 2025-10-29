package OrangeCloud.UserRepo.config;

import OrangeCloud.UserRepo.filter.JwtAuthenticationFilter;
import OrangeCloud.UserRepo.filter.JwtExceptionFilter;
import OrangeCloud.UserRepo.service.AuthService; // 💡 AuthService 임포트 추가
import OrangeCloud.UserRepo.util.JwtTokenProvider; // 💡 JwtTokenProvider 임포트 추가
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  
    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            // 💡 필터들을 메서드 인자로 직접 주입받습니다.
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtExceptionFilter jwtExceptionFilter
    ) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Swagger UI 경로 허용
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-resources/**").permitAll()
                        // 인증 API 허용 (회원가입, 로그인)
                        .requestMatchers("/api/auth/signup").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/refresh").permitAll()
                        // 테스트 엔드포인트 허용
                        .requestMatchers("/test").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/health").permitAll()
                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )
                // JWT 예외 처리 필터를 JWT 인증 필터 앞에 추가
                .addFilterBefore(jwtExceptionFilter, JwtAuthenticationFilter.class) // 💡 필터 순서 수정
                // JWT 인증 필터 추가
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                )
                .build();
    }

    // ==================================================
    // 💡 커스텀 필터들을 빈으로 등록하는 메서드를 추가 (순환 참조 해결의 핵심)
    // ==================================================

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, AuthService authService) {
        // JwtAuthenticationFilter가 @Component가 아니므로, SecurityConfig에서
        // 필요한 의존성을 주입받아 인스턴스를 직접 생성하여 빈으로 등록합니다.
        return new JwtAuthenticationFilter(jwtTokenProvider, authService);
    }

    @Bean
    public JwtExceptionFilter jwtExceptionFilter() {
        // JwtExceptionFilter는 의존성이 없으므로 인스턴스만 생성합니다.
        // JwtExceptionFilter에 @Component가 붙어있다면 제거하고 이 빈을 사용해야 합니다.
        return new JwtExceptionFilter();
    }

    // ==================================================

    @Bean
    public BCryptPasswordEncoder encodePassword() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 Origin 설정
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:8000"

        ));

        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // 허용할 헤더
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // 인증 정보 포함 허용
        configuration.setAllowCredentials(true);

        // preflight 요청 캐시 시간 (초)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}