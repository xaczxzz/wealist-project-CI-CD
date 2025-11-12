package com.wealist.user.config;

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

import java.util.*;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class TestDataInitializer {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final WorkspaceRepository workspaceRepository;
    private final Environment environment;

    private static final int WORKSPACE_COUNT = 10;
    private static final int USER_COUNT = 50;
    private static final int MIN_USERS_PER_WORKSPACE = 5;

    @Bean
    public CommandLineRunner initializeTestData() {
        return args -> {
            String[] activeProfiles = environment.getActiveProfiles();
            boolean isTestEnvironment = Arrays.asList(activeProfiles).contains("test")
                    || activeProfiles.length == 0;

            if (!isTestEnvironment) {
                log.info("⏭️  Not a test environment. Skipping test data initialization.");
                return;
            }

            log.info("🚀 Starting test data initialization...");

            if (userRepository.count() > 0 && workspaceRepository.count() > 0) {
                log.info("✅ Database already initialized. Skipping test data creation.");
                return;
            }

            // 1️⃣ 기본 소유자 유저 생성
            User owner = createInitialUser();

            // 2️⃣ 워크스페이스 10개 생성
            List<Workspace> workspaces = createWorkspaces(owner, WORKSPACE_COUNT);

            // 3️⃣ 유저 50명 생성
            List<User> users = createTestUsers(owner, USER_COUNT);

            // 4️⃣ 각 워크스페이스에 최소 5명씩 배정
            assignUsersToWorkspaces(users, workspaces, MIN_USERS_PER_WORKSPACE);

            log.info("🎉 Test data initialization completed! Created {} users and {} workspaces.",
                    users.size(), workspaces.size());
        };
    }

    // ----------------------------------------------------------------------------------------
    // User 관련
    // ----------------------------------------------------------------------------------------
    private User createInitialUser() {
        return userRepository.findByEmail("owner@wealist.com")
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email("owner@wealist.com")
                                .provider("google")
                                .googleId("google-id-owner")
                                .isActive(true)
                                .build()
                ));
    }

    private List<User> createTestUsers(User owner, int count) {
        List<User> users = new ArrayList<>();
        users.add(owner);

        for (int i = 1; i <= count; i++) {
            String email = "testuser" + i + "@wealist.com";
            if (userRepository.existsByEmailAndIsActiveTrue(email)) continue;

            User user = User.builder()
                    .email(email)
                    .provider("google")
                    .googleId("google-id-" + i)
                    .isActive(true)
                    .build();

            users.add(userRepository.save(user));
        }
        return users;
    }

    // ----------------------------------------------------------------------------------------
    // Workspace 관련
    // ----------------------------------------------------------------------------------------
    private List<Workspace> createWorkspaces(User owner, int count) {
        List<Workspace> workspaces = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Workspace workspace = Workspace.builder()
                    .ownerId(owner.getUserId())
                    .workspaceName("Test Workspace " + i)
                    .workspaceDescription("Auto-generated workspace number " + i)
                    .isPublic(i % 2 == 0)
                    .needApproved(i % 3 != 0)
                    .build();

            workspaces.add(workspaceRepository.save(workspace));
        }
        return workspaces;
    }

    // ----------------------------------------------------------------------------------------
    // UserProfile 생성 & 워크스페이스 배정
    // ----------------------------------------------------------------------------------------
    private void assignUsersToWorkspaces(List<User> users, List<Workspace> workspaces, int minUsersPerWorkspace) {
        Random random = new Random();
        int totalUsers = users.size();

        // 1️⃣ 워크스페이스별 최소 사용자 배정
        for (Workspace workspace : workspaces) {
            Set<Integer> assignedIndices = new HashSet<>();
            while (assignedIndices.size() < minUsersPerWorkspace) {
                int idx = random.nextInt(totalUsers);
                if (assignedIndices.contains(idx)) continue;
                assignedIndices.add(idx);

                User user = users.get(idx);
                createProfileIfNotExists(user, workspace);
            }
        }

        // 2️⃣ 나머지 유저들을 랜덤 워크스페이스에 배정
        for (User user : users) {
            // 이미 배정된 워크스페이스 수는 1~3개로 제한
            int profilesCount = userProfileRepository.countByUserId(user.getUserId());
            int remainingProfiles = random.nextInt(3 - profilesCount + 1);

            for (int i = 0; i < remainingProfiles; i++) {
                Workspace workspace = workspaces.get(random.nextInt(workspaces.size()));
                createProfileIfNotExists(user, workspace);
            }
        }
    }

    private void createProfileIfNotExists(User user, Workspace workspace) {
        boolean exists = userProfileRepository
                .existsByUserIdAndWorkspaceId(user.getUserId(), workspace.getWorkspaceId());
        if (exists) return;

        UserProfile profile = UserProfile.builder()
                .userId(user.getUserId())
                .workspaceId(workspace.getWorkspaceId())
                .nickName(user.getEmail().split("@")[0])
                .email(user.getEmail())
                .profileImageUrl("https://i.pravatar.cc/150?u=" + user.getUserId())
                .build();

        userProfileRepository.save(profile);
    }
}
