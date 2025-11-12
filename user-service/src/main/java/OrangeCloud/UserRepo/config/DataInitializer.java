package OrangeCloud.UserRepo.config;

import OrangeCloud.UserRepo.entity.User;
import OrangeCloud.UserRepo.entity.UserProfile;
import OrangeCloud.UserRepo.entity.Workspace;
import OrangeCloud.UserRepo.repository.UserProfileRepository;
import OrangeCloud.UserRepo.repository.UserRepository;
import OrangeCloud.UserRepo.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 애플리케이션 시작 시 더미 데이터를 자동으로 생성합니다.
 * - 개발 환경에서만 실행됩니다 (dev, local 프로파일)
 * - 이미 데이터가 있으면 건너뜁니다
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final WorkspaceRepository workspaceRepository;
    private final Environment environment;

    @Bean
    @Transactional
    public CommandLineRunner initializeData() {
        return args -> {
            // 개발 환경에서만 실행
            String[] activeProfiles = environment.getActiveProfiles();
            boolean isDevelopment = Arrays.asList(activeProfiles).contains("dev")
                                 || Arrays.asList(activeProfiles).contains("local")
                                 || activeProfiles.length == 0;

            if (!isDevelopment) {
                log.info("⏭️  Production environment detected. Skipping dummy data initialization.");
                return;
            }

            // 데이터가 이미 충분히 있는지 확인
            if (userRepository.count() >= 50 && workspaceRepository.count() >= 10 && userProfileRepository.count() >= 50) {
                log.info("✅ Database already has sufficient data. Skipping initialization.");
                return;
            }

            log.info("🚀 Starting dummy data initialization...");

            // 1. 사용자 50명 생성
            List<User> users = new ArrayList<>();
            if (userRepository.count() < 50) {
                for (int i = 1; i <= 50; i++) {
                    String email = "user" + i + "@example.com";
                    if (userRepository.existsByEmailAndIsActiveTrue(email)) {
                        continue;
                    }
                    User user = User.builder()
                            .email(email)
                            .provider("google")
                            .googleId("google-id-" + String.format("%03d", i))
                            .isActive(true)
                            .build();
                    users.add(user);
                }
                userRepository.saveAll(users);
                log.info("✅ Created {} users.", users.size());
            }
            // 이미 생성된 사용자를 포함하여 50명을 가져옵니다.
            List<User> allUsers = userRepository.findAll();


            // 2. 워크스페이스 10개 생성
            List<Workspace> workspaces = new ArrayList<>();
            if (workspaceRepository.count() < 10) {
                for (int i = 0; i < 10; i++) {
                    User owner = allUsers.get(i);
                    Workspace workspace = Workspace.builder()
                            .workspaceName("테스트 워크스페이스 " + (i + 1))
                            .workspaceDescription("이것은 테스트 워크스페이스 " + (i + 1) + "입니다.")
                            .ownerId(owner.getUserId())
                            .build();
                    workspaces.add(workspace);
                }
                workspaceRepository.saveAll(workspaces);
                log.info("✅ Created {} workspaces.", workspaces.size());
            }
            // 이미 생성된 워크스페이스를 포함하여 10개를 가져옵니다.
            List<Workspace> allWorkspaces = workspaceRepository.findAll();


            // 3. 사용자 프로필 50개 생성
            List<UserProfile> profiles = new ArrayList<>();
            if (userProfileRepository.count() < 50) {
                for (int i = 0; i < allUsers.size(); i++) {
                    User user = allUsers.get(i);
                    // 처음 10개 워크스페이스 중 하나에 프로필을 할당합니다.
                    // 여기서는 간단하게 모든 유저를 첫번째 워크스페이스에 할당합니다.
                    // 좀 더 복잡한 로직을 원하면 (i % allWorkspaces.size()) 등을 사용할 수 있습니다.
                    Workspace targetWorkspace = allWorkspaces.get(0);

                    // 해당 유저가 해당 워크스페이스에 이미 프로필을 가지고 있는지 확인
                    if (userProfileRepository.existsByUserIdAndWorkspaceId(user.getUserId(), targetWorkspace.getWorkspaceId())) {
                        continue;
                    }

                    UserProfile profile = UserProfile.builder()
                            .userId(user.getUserId())
                            .workspaceId(targetWorkspace.getWorkspaceId())
                            .nickName("테스터" + (i + 1))
                            .email(user.getEmail())
                            .profileImageUrl("https://i.pravatar.cc/150?img=" + (i + 1))
                            .build();
                    profiles.add(profile);
                }
                userProfileRepository.saveAll(profiles);
                log.info("✅ Created {} user profiles.", profiles.size());
            }

            log.info("🎉 Data initialization finished successfully.");
        };
    }
}
