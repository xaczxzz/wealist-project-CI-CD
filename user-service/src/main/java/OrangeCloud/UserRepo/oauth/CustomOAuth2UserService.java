package OrangeCloud.UserRepo.oauth;

import OrangeCloud.UserRepo.entity.User;
import OrangeCloud.UserRepo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        log.info("Google OAuth2 로그인 시도: {}", oAuth2User.getAttributes());

        // Google에서 제공하는 사용자 정보 추출
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // DB에 사용자 저장 또는 업데이트
        User user = saveOrUpdate(email, name, registrationId);

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }

    private User saveOrUpdate(String email, String name, String provider) {
        // 활성화된 사용자만 조회 및 업데이트
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .map(entity -> entity.updateOAuth2Info(name))
                .orElse(User.builder()
                        .name(name)
                        .email(email)
                        .provider(provider)
                        .role("ROLE_USER")
                        .build());

        return userRepository.save(user);
    }
}