import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { PutObjectCommandInput } from '@aws-sdk/client-s3';

// =========================================================================
// ⚠️ 보안 경고: 이 설정은 실제 프로덕션 환경에서 사용해서는 안 됩니다.
//             클라이언트에서 S3에 직접 업로드하는 방식은 임시 자격 증명을
//             사용하거나(Cognito/STS), 백엔드에서 Pre-Signed URL을 받아야 합니다.
// =========================================================================

const S3_CONFIG = {
  // 💡 AWS 리전 설정 (사용자 환경에 맞게 수정 필요)
  region: 'ap-northeast-2',
  // accessKeyId, secretAccessKey 필드는 여기에 직접 하드코딩하지 않습니다.
  // Docker 환경 변수나 IAM Role을 통해 자동으로 로드되도록 구성해야 합니다.
};

const s3Client = new S3Client(S3_CONFIG);
const S3_BUCKET_NAME = 'your-orange-cloud-bucket'; // ⚠️ 실제 버킷 이름으로 변경 필요

/**
 * 프로필 이미지를 S3에 업로드하고, 해당 이미지의 공개 URL을 반환합니다.
 * @param file 사용자가 선택한 File 객체
 * @param userId 현재 로그인한 사용자 ID (S3 경로 구성에 사용)
 * @returns 업로드된 파일의 공개 URL (string)
 */
export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
  // 1. 파일 경로 정의: userProfile/userId/{timestamp}.{ext}
  const fileExtension = file.name.split('.').pop();
  const uniqueFileName = `${Date.now()}.${fileExtension}`;
  const s3Key = `userProfile/${userId}/${uniqueFileName}`;

  const params: PutObjectCommandInput = {
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
    Body: file,
    ContentType: file.type,
    ACL: 'public-read', // ⚠️ 버킷 설정이 Public Read를 허용해야 합니다.
  };

  console.log(`[S3 Upload] Uploading to bucket: ${S3_BUCKET_NAME}, Key: ${s3Key}`);

  try {
    const upload = new Upload({
      client: s3Client,
      params: params,
      queueSize: 4,
      partSize: 1024 * 1024 * 5, // 5MB
    });

    const result = await upload.done();

    // v3 SDK의 lib-storage 결과에서 Location을 추출하여 URL 반환
    const fileUrl =
      (result as { Location?: string }).Location ||
      `https://${S3_BUCKET_NAME}.s3.${S3_CONFIG.region}.amazonaws.com/${s3Key}`;

    console.log('✅ S3 Upload Success:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('❌ S3 Upload Failed:', error);
    throw new Error('S3 이미지 업로드에 실패했습니다. (SDK 설정 및 권한 확인 필요)');
  }
};
