package OrangeCloud.UserRepo.oauth;

import OrangeCloud.UserRepo.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Getter
@RequiredArgsConstructor
public class CustomOAuth2User implements OAuth2User {

    private final User user;
    private final Map<String, Object> attributes;

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
                new SimpleGrantedAuthority(user.getRole())
        );
    }

    @Override
    public String getName() {
        return user.getEmail();
    }

    public String getEmail() {
        return user.getEmail();
    }

    // UUID 반환 (JwtTokenProvider에서 사용)
    public UUID getUserId() {
        return user.getUserId();
    }
}