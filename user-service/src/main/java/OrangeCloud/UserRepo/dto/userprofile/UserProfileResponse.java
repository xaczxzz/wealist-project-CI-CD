package OrangeCloud.UserRepo.dto.userprofile;

import OrangeCloud.UserRepo.entity.UserProfile;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Schema(description = "사용자 프로필 응답 DTO")
public record UserProfileResponse(
        UUID profileId,
        UUID userId,
        String nickName,
        String email,
        String profileImageUrl,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime updatedAt
) {
    // 💡 Controller에서 발생하는 오류를 해결하는 정적 팩토리 메서드
    public static UserProfileResponse from(UserProfile profile) {
        return UserProfileResponse.builder()
                .profileId(profile.getProfileId())
                .userId(profile.getUserId())
                .nickName(profile.getNickName())
                .email(profile.getEmail())
                .profileImageUrl(profile.getProfileImageUrl())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}