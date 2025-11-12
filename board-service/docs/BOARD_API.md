# Board Service API Documentation

## Overview

Board Service는 weAlist 프로젝트 관리 플랫폼의 칸반 보드 관리를 위한 Go 기반 마이크로서비스입니다.

**Base URL**: `http://localhost:8000/api`

**Version**: 1.0

**Authentication**: Bearer Token (JWT)

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [API Endpoints](#api-endpoints)
  - [Boards](#boards)
  - [Comments](#comments)
  - [Projects](#projects)
  - [Project Members](#project-members)
  - [Join Requests](#join-requests)
- [Data Models](#data-models)
- [Error Codes](#error-codes)

---

## Authentication

모든 API 엔드포인트는 `/health`를 제외하고 JWT 인증이 필요합니다.

**Header**:
```
Authorization: Bearer <JWT_TOKEN>
```

**토큰 획득 방법** (개발 환경):
```bash
# User Service에서 테스트 토큰 발급
curl -X POST http://localhost:8080/api/auth/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-uuid-here"}'
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## API Endpoints

### Boards

칸반 보드(카드/태스크) 관리 API

#### Get Boards
프로젝트의 보드 목록을 조회합니다 (필터링, 페이지네이션 지원).

**Endpoint**: `GET /api/boards`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | 프로젝트 ID |
| `stageId` | string (UUID) | No | Stage 필터 |
| `roleId` | string (UUID) | No | Role 필터 |
| `importanceId` | string (UUID) | No | Importance 필터 |
| `assigneeId` | string (UUID) | No | 담당자 필터 |
| `authorId` | string (UUID) | No | 작성자 필터 |
| `page` | integer | No | 페이지 번호 (기본: 1) |
| `limit` | integer | No | 페이지 크기 (기본: 20, 최대: 100) |

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "boardId": "uuid",
        "projectId": "uuid",
        "title": "Board title",
        "content": "Board content",
        "position": "a0V",
        "assignee": {
          "userId": "uuid",
          "userName": "John Doe",
          "userAvatar": "https://..."
        },
        "author": {
          "userId": "uuid",
          "userName": "Jane Doe",
          "userAvatar": "https://..."
        },
        "dueDate": "2025-12-31T23:59:59Z",
        "customFields": { ... },
        "createdAt": "2025-01-10T10:00:00Z",
        "updatedAt": "2025-01-11T15:30:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

---

#### Create Board
새 보드(카드)를 생성합니다.

**Endpoint**: `POST /api/boards`

**Request Body**:
```json
{
  "projectId": "uuid",
  "title": "New board title",
  "content": "Board content (optional)",
  "assigneeId": "uuid (optional)",
  "dueDate": "2025-12-31T23:59:59Z (optional)",
  "stageId": "uuid (optional, legacy)",
  "roleIds": ["uuid1", "uuid2"] "(optional, legacy)",
  "importanceId": "uuid (optional, legacy)"
}
```

**Validation**:
- `title`: 필수, 1-200자
- `content`: 선택, 최대 5000자
- `projectId`: 필수, UUID 형식

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "boardId": "uuid",
    "projectId": "uuid",
    "title": "New board title",
    ...
  }
}
```

---

#### Get Board
특정 보드를 조회합니다 (프로젝트 멤버만 가능).

**Endpoint**: `GET /api/boards/{boardId}`

**Path Parameters**:
- `boardId` (UUID): 보드 ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "boardId": "uuid",
    "title": "Board title",
    ...
  }
}
```

**Error Responses**:
- `403 Forbidden`: 프로젝트 멤버가 아닌 경우
- `404 Not Found`: 보드를 찾을 수 없음

---

#### Update Board
보드를 수정합니다 (작성자 또는 ADMIN 이상만 가능).

**Endpoint**: `PUT /api/boards/{boardId}`

**Path Parameters**:
- `boardId` (UUID): 보드 ID

**Request Body** (모든 필드 선택):
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "assigneeId": "uuid",
  "dueDate": "2025-12-31T23:59:59Z",
  "stageId": "uuid",
  "roleIds": ["uuid1", "uuid2"],
  "importanceId": "uuid"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "boardId": "uuid",
    "title": "Updated title",
    ...
  }
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 입력값
- `403 Forbidden`: 권한 없음 (작성자 또는 ADMIN 아님)
- `404 Not Found`: 보드를 찾을 수 없음

---

#### Delete Board
보드를 삭제합니다 (Soft Delete, 작성자 또는 ADMIN 이상만 가능).

**Endpoint**: `DELETE /api/boards/{boardId}`

**Path Parameters**:
- `boardId` (UUID): 보드 ID

**Response**: `200 OK`
```json
{
  "success": true
}
```

**Error Responses**:
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 보드를 찾을 수 없음

---

#### Move Board
보드를 다른 컬럼/그룹으로 이동합니다 (필드 값 변경 + 순서 업데이트를 단일 트랜잭션으로 처리).

**Endpoint**: `PUT /api/boards/{boardId}/move`

**Path Parameters**:
- `boardId` (UUID): 보드 ID

**Request Body**:
```json
{
  "projectId": "uuid",
  "viewType": "stage",
  "columnValue": "uuid",
  "beforePosition": "a0V",
  "afterPosition": "a1"
}
```

**Parameters**:
- `projectId`: 프로젝트 ID
- `viewType`: 뷰 타입 (`stage`, `role`, `importance` 등)
- `columnValue`: 이동할 컬럼의 값 (예: Stage ID)
- `beforePosition`: 이동 위치의 이전 보드 position (선택)
- `afterPosition`: 이동 위치의 다음 보드 position (선택)

**Fractional Indexing**:
- `beforePosition`와 `afterPosition` 사이의 새 position이 자동 계산됩니다
- 예: "a0"와 "a1" 사이 → "a0V"

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "boardId": "uuid",
    "position": "a0V",
    "updatedField": "stageId",
    "updatedValue": "uuid"
  }
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 position 값
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 보드를 찾을 수 없음

---

### Comments

보드 댓글 관리 API

#### Create Comment
보드에 새 댓글을 작성합니다.

**Endpoint**: `POST /api/comments`

**Request Body**:
```json
{
  "boardId": "uuid",
  "content": "Comment content"
}
```

**Validation**:
- `boardId`: 필수, UUID 형식
- `content`: 필수, 1-2000자

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "commentId": "uuid",
    "userId": "uuid",
    "userName": "John Doe",
    "userAvatar": "https://...",
    "content": "Comment content",
    "createdAt": "2025-01-11T10:00:00Z",
    "updatedAt": "2025-01-11T10:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 입력값
- `403 Forbidden`: 프로젝트 멤버가 아님
- `404 Not Found`: 보드를 찾을 수 없음

---

#### Get Comments by Board
특정 보드의 모든 댓글을 조회합니다 (프로젝트 멤버만 가능).

**Endpoint**: `GET /api/comments`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `boardId` | string (UUID) | Yes | 보드 ID |

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "commentId": "uuid",
      "userId": "uuid",
      "userName": "John Doe",
      "userAvatar": "https://...",
      "content": "Comment content",
      "createdAt": "2025-01-11T10:00:00Z",
      "updatedAt": "2025-01-11T10:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: boardId 누락
- `403 Forbidden`: 프로젝트 멤버가 아님
- `404 Not Found`: 보드를 찾을 수 없음

---

#### Update Comment
댓글을 수정합니다 (작성자만 가능).

**Endpoint**: `PUT /api/comments/{commentId}`

**Path Parameters**:
- `commentId` (UUID): 댓글 ID

**Request Body**:
```json
{
  "content": "Updated content"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "commentId": "uuid",
    "content": "Updated content",
    "updatedAt": "2025-01-11T15:00:00Z",
    ...
  }
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 입력값
- `403 Forbidden`: 작성자가 아님
- `404 Not Found`: 댓글을 찾을 수 없음

---

#### Delete Comment
댓글을 삭제합니다 (Soft Delete, 작성자만 가능).

**Endpoint**: `DELETE /api/comments/{commentId}`

**Path Parameters**:
- `commentId` (UUID): 댓글 ID

**Response**: `204 No Content`

**Error Responses**:
- `400 Bad Request`: 잘못된 commentId 형식
- `403 Forbidden`: 작성자가 아님
- `404 Not Found`: 댓글을 찾을 수 없음

---

### Projects

프로젝트 관리 API

#### Get Projects
워크스페이스의 모든 프로젝트를 조회합니다 (워크스페이스 멤버만 가능).

**Endpoint**: `GET /api/projects`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string (UUID) | Yes | 워크스페이스 ID |

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "projectId": "uuid",
      "workspaceId": "uuid",
      "projectName": "Project name",
      "description": "Project description",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-10T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: workspaceId 누락
- `403 Forbidden`: 워크스페이스 멤버가 아님

---

#### Create Project
새 프로젝트를 생성합니다 (워크스페이스 ADMIN 이상만 가능).

**Endpoint**: `POST /api/projects`

**Request Body**:
```json
{
  "workspaceId": "uuid",
  "projectName": "New Project",
  "description": "Project description (optional)"
}
```

**Validation**:
- `workspaceId`: 필수, UUID 형식
- `projectName`: 필수, 1-100자
- `description`: 선택, 최대 500자

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "workspaceId": "uuid",
    "projectName": "New Project",
    "description": "Project description",
    "createdAt": "2025-01-11T10:00:00Z",
    "updatedAt": "2025-01-11T10:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 입력값
- `403 Forbidden`: ADMIN 권한 없음

---

#### Get Project
특정 프로젝트를 조회합니다 (프로젝트 멤버만 가능).

**Endpoint**: `GET /api/projects/{projectId}`

**Path Parameters**:
- `projectId` (UUID): 프로젝트 ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "projectName": "Project name",
    ...
  }
}
```

**Error Responses**:
- `403 Forbidden`: 프로젝트 멤버가 아님
- `404 Not Found`: 프로젝트를 찾을 수 없음

---

#### Update Project
프로젝트를 수정합니다 (ADMIN 이상만 가능).

**Endpoint**: `PUT /api/projects/{projectId}`

**Path Parameters**:
- `projectId` (UUID): 프로젝트 ID

**Request Body** (모든 필드 선택):
```json
{
  "projectName": "Updated name",
  "description": "Updated description"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "projectName": "Updated name",
    ...
  }
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 입력값
- `403 Forbidden`: ADMIN 권한 없음
- `404 Not Found`: 프로젝트를 찾을 수 없음

---

#### Delete Project
프로젝트를 삭제합니다 (Soft Delete, ADMIN 이상만 가능).

**Endpoint**: `DELETE /api/projects/{projectId}`

**Path Parameters**:
- `projectId` (UUID): 프로젝트 ID

**Response**: `200 OK`
```json
{
  "success": true
}
```

**Error Responses**:
- `403 Forbidden`: ADMIN 권한 없음
- `404 Not Found`: 프로젝트를 찾을 수 없음

---

#### Search Projects
프로젝트를 검색합니다 (워크스페이스 멤버만 가능).

**Endpoint**: `GET /api/projects/search`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string (UUID) | Yes | 워크스페이스 ID |
| `keyword` | string | Yes | 검색 키워드 (프로젝트명) |

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "projectId": "uuid",
      "projectName": "Matching Project",
      ...
    }
  ]
}
```

---

### Project Members

프로젝트 멤버 관리 API

#### Get Project Members
프로젝트의 모든 멤버를 조회합니다 (프로젝트 멤버만 가능).

**Endpoint**: `GET /api/projects/{projectId}/members`

**Path Parameters**:
- `projectId` (UUID): 프로젝트 ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "memberId": "uuid",
      "userId": "uuid",
      "userName": "John Doe",
      "userAvatar": "https://...",
      "role": "ADMIN",
      "joinedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `403 Forbidden`: 프로젝트 멤버가 아님
- `404 Not Found`: 프로젝트를 찾을 수 없음

---

#### Remove Project Member
프로젝트에서 멤버를 제거합니다 (ADMIN 이상만 가능).

**Endpoint**: `DELETE /api/projects/{projectId}/members/{memberId}`

**Path Parameters**:
- `projectId` (UUID): 프로젝트 ID
- `memberId` (UUID): 멤버 ID (user_id)

**Response**: `200 OK`
```json
{
  "success": true
}
```

**Error Responses**:
- `403 Forbidden`: ADMIN 권한 없음
- `404 Not Found`: 멤버를 찾을 수 없음

---

#### Update Member Role
프로젝트 멤버의 역할을 변경합니다 (OWNER만 가능).

**Endpoint**: `PUT /api/projects/{projectId}/members/{memberId}/role`

**Path Parameters**:
- `projectId` (UUID): 프로젝트 ID
- `memberId` (UUID): 멤버 ID (user_id)

**Request Body**:
```json
{
  "role": "ADMIN"
}
```

**Available Roles**:
- `OWNER`: 프로젝트 소유자
- `ADMIN`: 관리자
- `MEMBER`: 일반 멤버

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "memberId": "uuid",
    "role": "ADMIN",
    ...
  }
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 role 값
- `403 Forbidden`: OWNER 권한 없음
- `404 Not Found`: 멤버를 찾을 수 없음

---

### Join Requests

프로젝트 가입 요청 관리 API

#### Create Join Request
프로젝트 가입 요청을 생성합니다.

**Endpoint**: `POST /api/projects/{projectId}/join-requests`

**Path Parameters**:
- `projectId` (UUID): 프로젝트 ID

**Request Body**:
```json
{
  "message": "Please add me to the project (optional)"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "joinRequestId": "uuid",
    "projectId": "uuid",
    "userId": "uuid",
    "message": "Please add me to the project",
    "status": "PENDING",
    "createdAt": "2025-01-11T10:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: 이미 멤버이거나 이미 요청이 존재함
- `404 Not Found`: 프로젝트를 찾을 수 없음

---

#### Get Join Requests (User)
현재 사용자의 모든 가입 요청을 조회합니다.

**Endpoint**: `GET /api/projects/join-requests`

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "joinRequestId": "uuid",
      "projectId": "uuid",
      "projectName": "Project name",
      "status": "PENDING",
      "createdAt": "2025-01-11T10:00:00Z"
    }
  ]
}
```

---

#### Update Join Request
가입 요청을 승인/거절합니다 (ADMIN 이상만 가능).

**Endpoint**: `PUT /api/projects/join-requests/{joinRequestId}`

**Path Parameters**:
- `joinRequestId` (UUID): 가입 요청 ID

**Request Body**:
```json
{
  "status": "APPROVED"
}
```

**Available Status**:
- `APPROVED`: 승인 (자동으로 프로젝트 멤버로 추가)
- `REJECTED`: 거절

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "joinRequestId": "uuid",
    "status": "APPROVED",
    "updatedAt": "2025-01-11T15:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 status 값
- `403 Forbidden`: ADMIN 권한 없음
- `404 Not Found`: 요청을 찾을 수 없음

---

## Data Models

### BoardResponse
```json
{
  "boardId": "string (UUID)",
  "projectId": "string (UUID)",
  "title": "string",
  "content": "string",
  "position": "string (fractional index)",
  "assignee": {
    "userId": "string (UUID)",
    "userName": "string",
    "userAvatar": "string (URL)"
  },
  "author": {
    "userId": "string (UUID)",
    "userName": "string",
    "userAvatar": "string (URL)"
  },
  "dueDate": "string (ISO 8601)",
  "customFields": {
    "field_id": "value"
  },
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### CommentResponse
```json
{
  "commentId": "string (UUID)",
  "userId": "string (UUID)",
  "userName": "string",
  "userAvatar": "string (URL)",
  "content": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### ProjectResponse
```json
{
  "projectId": "string (UUID)",
  "workspaceId": "string (UUID)",
  "projectName": "string",
  "description": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### ProjectMemberResponse
```json
{
  "memberId": "string (UUID)",
  "userId": "string (UUID)",
  "userName": "string",
  "userAvatar": "string (URL)",
  "role": "string (OWNER|ADMIN|MEMBER)",
  "joinedAt": "string (ISO 8601)"
}
```

### ProjectJoinRequestResponse
```json
{
  "joinRequestId": "string (UUID)",
  "projectId": "string (UUID)",
  "userId": "string (UUID)",
  "message": "string",
  "status": "string (PENDING|APPROVED|REJECTED)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | 인증 토큰이 없거나 유효하지 않음 |
| `FORBIDDEN` | 403 | 권한이 없음 (프로젝트 멤버 아님, ADMIN 권한 없음 등) |
| `NOT_FOUND` | 404 | 리소스를 찾을 수 없음 (Board, Project, Comment 등) |
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `BAD_REQUEST` | 400 | 잘못된 요청 (UUID 형식 오류, 필수 파라미터 누락 등) |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |
| `CONFLICT` | 409 | 리소스 충돌 (이미 존재하는 요청 등) |

---

## Notes

### Fractional Indexing
보드 순서는 **Fractional Indexing** 방식을 사용합니다:
- Position은 문자열 (예: "a0", "a0V", "a1", "a2")
- 사전순(Lexicographic) 정렬
- 임의의 두 보드 사이에 O(1) 시간에 삽입 가능
- 기존 보드들의 position 업데이트 불필요

**예시**:
```
보드 A (position: "a0")
보드 B (position: "a1")

→ A와 B 사이에 보드 삽입 → position: "a0V"

최종 순서:
- 보드 A (a0)
- 새 보드 (a0V)
- 보드 B (a1)
```

### Legacy Fields (Deprecated)
다음 필드들은 Legacy 시스템이며 향후 Custom Fields로 대체될 예정입니다:
- `stageId`
- `roleIds`
- `importanceId`

새로운 기능 개발 시 Custom Fields API를 사용하세요.

### Soft Delete
모든 삭제 작업은 **Soft Delete** 방식을 사용합니다:
- 실제 DB에서 삭제되지 않음
- `is_deleted` 플래그가 `true`로 설정됨
- API 응답에는 포함되지 않음
- 데이터 복구 및 감사 로그 유지 가능

---

## Swagger UI

개발 환경에서 Swagger UI를 통해 API를 테스트할 수 있습니다:

**URL**: http://localhost:8000/swagger/index.html

**주의**: Production 환경에서는 Swagger UI가 비활성화됩니다.

---

## Support

- **문서**: [CLAUDE.md](../CLAUDE.md)
- **테스트 스크립트**: `../scripts/board_test_script/test_board_service.sh`
- **이슈 제보**: GitHub Issues
