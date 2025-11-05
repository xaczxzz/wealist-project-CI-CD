#!/bin/bash

set -e  # 에러 발생 시 스크립트 중단

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8000"
USER_SERVICE_URL="http://localhost:8080"

# Test user credentials
OWNER_EMAIL="board.owner@example.com"
OWNER_PASSWORD="password123"
OWNER_NAME="Board Owner User"

MEMBER_EMAIL="board.member@example.com"
MEMBER_PASSWORD="password123"
MEMBER_NAME="Board Member User"

# Global variables
OWNER_TOKEN=""
OWNER_USER_ID=""
MEMBER_TOKEN=""
MEMBER_USER_ID=""
WORKSPACE_ID=""
PROJECT_ID=""
KANBAN_ID=""

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE} Board Service 통합 테스트 시작 (댓글 및 권한)${NC}"
echo -e "${BLUE}============================================${NC}"

# Function to print step
print_step() {
    echo -e "\n${YELLOW}📋 STEP $1: $2${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Function to make API call and extract data
# This function is simplified and captures stdout and http_code separately
api_call() {
    local method=$1
    local url=$2
    local data=$3
    local token=$4

    # Temporary file to store response body
    local response_file=$(mktemp)

    HTTP_CODE=$(curl -s -w "%{http_code}" -o "$response_file" -X "$method" "$url" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$data")

    RESPONSE_BODY=$(cat "$response_file")
    rm "$response_file"
}

# Step 1: Health Check
print_step 1 "Health Check"
api_call "GET" "$BASE_URL/health"
if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Board Service is healthy"
else
    print_error "Health check failed with status $HTTP_CODE. Response: $RESPONSE_BODY"
fi

# Step 2: User Registration & Login
print_step 2 "사용자 2명 등록 및 로그인"

# Register and Login OWNER
register_data_owner="{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASSWORD\",\"name\":\"$OWNER_NAME\"}"
api_call "POST" "$USER_SERVICE_URL/temp/signup" "$register_data_owner"
login_data_owner="{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASSWORD\"}"
api_call "POST" "$USER_SERVICE_URL/temp/login" "$login_data_owner"
OWNER_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
OWNER_USER_ID=$(echo "$RESPONSE_BODY" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
if [ -n "$OWNER_TOKEN" ]; then
    print_success "Owner 로그인 성공"
else
    print_error "Owner 로그인 실패: $RESPONSE_BODY"
fi

# Register and Login MEMBER
register_data_member="{\"email\":\"$MEMBER_EMAIL\",\"password\":\"$MEMBER_PASSWORD\",\"name\":\"$MEMBER_NAME\"}"
api_call "POST" "$USER_SERVICE_URL/temp/signup" "$register_data_member"
login_data_member="{\"email\":\"$MEMBER_EMAIL\",\"password\":\"$MEMBER_PASSWORD\"}"
api_call "POST" "$USER_SERVICE_URL/temp/login" "$login_data_member"
MEMBER_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
MEMBER_USER_ID=$(echo "$RESPONSE_BODY" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
if [ -n "$MEMBER_TOKEN" ]; then
    print_success "Member 로그인 성공"
else
    print_error "Member 로그인 실패: $RESPONSE_BODY"
fi

# Step 3: Workspace 생성 (by Owner)
print_step 3 "Workspace 생성 (by Owner)"
workspace_data="{\"name\":\"Test Workspace\",\"description\":\"자동 테스트용 워크스페이스\"}"
api_call "POST" "$BASE_URL/api/workspaces" "$workspace_data" "$OWNER_TOKEN"
WORKSPACE_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$WORKSPACE_ID" ]; then
    print_success "Workspace 생성 성공 (ID: ${WORKSPACE_ID:0:8}...)"
else
    print_error "Workspace 생성 실패: $RESPONSE_BODY"
fi

# Step 4: Project 생성 (by Owner)
print_step 4 "Project 생성 (by Owner)"
project_data="{\"workspaceId\":\"$WORKSPACE_ID\",\"name\":\"Test Project\",\"description\":\"자동 테스트용 프로젝트\"}"
api_call "POST" "$BASE_URL/api/projects" "$project_data" "$OWNER_TOKEN"
PROJECT_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$PROJECT_ID" ]; then
    print_success "Project 생성 성공 (ID: ${PROJECT_ID:0:8}...)"
else
    print_error "Project 생성 실패: $RESPONSE_BODY"
fi

# Step 5: Invite and Join Member
print_step 5 "멤버 초대 및 프로젝트 참여"

# 5.1: Member requests to join WORKSPACE
ws_join_req_data="{\"workspaceId\":\"$WORKSPACE_ID\"}"
api_call "POST" "$BASE_URL/api/workspaces/join-requests" "$ws_join_req_data" "$MEMBER_TOKEN"
if [ "$HTTP_CODE" -ne 201 ]; then
    print_error "멤버의 워크스페이스 참여 요청 실패: $RESPONSE_BODY"
fi
print_success "멤버가 워크스페이스 참여 요청 성공"

# 5.2: Owner approves WORKSPACE join request
api_call "GET" "$BASE_URL/api/workspaces/$WORKSPACE_ID/join-requests" "" "$OWNER_TOKEN"
WS_JOIN_REQUEST_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$WS_JOIN_REQUEST_ID" ]; then
    print_error "워크스페이스 참여 요청 ID를 찾을 수 없음: $RESPONSE_BODY"
fi
ws_approve_data='{"status":"APPROVED"}'
api_call "PUT" "$BASE_URL/api/workspaces/join-requests/$WS_JOIN_REQUEST_ID" "$ws_approve_data" "$OWNER_TOKEN"
if [ "$HTTP_CODE" -ne 200 ]; then
    print_error "멤버의 워크스페이스 참여 요청 승인 실패: $RESPONSE_BODY"
fi
print_success "소유자가 멤버의 워크스페이스 참여 요청 승인 성공"

# 5.3: Member requests to join PROJECT
proj_join_req_data="{\"projectId\":\"$PROJECT_ID\"}"
api_call "POST" "$BASE_URL/api/projects/join-requests" "$proj_join_req_data" "$MEMBER_TOKEN"
if [ "$HTTP_CODE" -ne 201 ]; then
    print_error "멤버의 프로젝트 참여 요청 실패: $RESPONSE_BODY"
fi
print_success "멤버가 프로젝트 참여 요청 성공"

# 5.4: Owner approves PROJECT join request
api_call "GET" "$BASE_URL/api/projects/$PROJECT_ID/join-requests" "" "$OWNER_TOKEN"
PROJ_JOIN_REQUEST_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$PROJ_JOIN_REQUEST_ID" ]; then
    print_error "프로젝트 참여 요청 ID를 찾을 수 없음: $RESPONSE_BODY"
fi
proj_approve_data='{"status":"APPROVED"}'
api_call "PUT" "$BASE_URL/api/projects/join-requests/$PROJ_JOIN_REQUEST_ID" "$proj_approve_data" "$OWNER_TOKEN"
if [ "$HTTP_CODE" -ne 200 ]; then
    print_error "멤버의 프로젝트 참여 요청 승인 실패: $RESPONSE_BODY"
fi
print_success "소유자가 멤버의 프로젝트 참여 요청 승인 성공"

# Step 6: 커스텀 역할 생성 (by Owner)
print_step 6 "커스텀 역할 생성 (by Owner)"
role_data="{\"projectId\":\"$PROJECT_ID\",\"name\":\"테스트 역할\",\"color\":\"#123456\"}"
api_call "POST" "$BASE_URL/api/custom-fields/roles" "$role_data" "$OWNER_TOKEN"
CUSTOM_ROLE_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$CUSTOM_ROLE_ID" ]; then
    print_error "커스텀 역할 생성 실패: $RESPONSE_BODY"
fi
print_success "커스텀 역할 생성 성공 (ID: ${CUSTOM_ROLE_ID:0:8}...)"

# Step 7: 칸반 생성 (by Owner)
print_step 7 "칸반 생성 (by Owner)"
api_call "GET" "$BASE_URL/api/custom-fields/projects/$PROJECT_ID/stages" "" "$OWNER_TOKEN"
STAGE_ID=$(echo "$RESPONSE_BODY" | grep -B2 -A2 '"name":"대기"' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

api_call "GET" "$BASE_URL/api/custom-fields/projects/$PROJECT_ID/importance" "" "$OWNER_TOKEN"
IMPORTANCE_ID=$(echo "$RESPONSE_BODY" | grep -B2 -A2 '"name":"보통"' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$STAGE_ID" ] || [ -z "$IMPORTANCE_ID" ]; then
    print_error "STAGE_ID 또는 IMPORTANCE_ID를 추출하지 못했습니다."
fi

kanban_data="{\"projectId\":\"$PROJECT_ID\",\"title\":\"테스트 칸반 1\",\"content\":\"댓글 테스트용 칸반\",\"stageId\":\"$STAGE_ID\",\"importanceId\":\"$IMPORTANCE_ID\",\"roleIds\":[\"$CUSTOM_ROLE_ID\"]}"
api_call "POST" "$BASE_URL/api/kanbans" "$kanban_data" "$OWNER_TOKEN"
KANBAN_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$KANBAN_ID" ]; then
    print_success "칸반 생성 성공 (ID: ${KANBAN_ID:0:8}...)"
else
    print_error "칸반 생성 실패: $RESPONSE_BODY"
fi

# Step 8: 댓글 기능 테스트 시작
print_step 8 "댓글 기능 테스트"

# 7.1: Member creates a comment
comment_data="{\"kanbanId\":\"$KANBAN_ID\",\"content\":\"안녕하세요! 멤버가 남기는 첫 댓글입니다. 👋\"}"
api_call "POST" "$BASE_URL/api/comments" "$comment_data" "$MEMBER_TOKEN"
COMMENT_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ "$HTTP_CODE" -eq 201 ] && [ -n "$COMMENT_ID" ]; then
    print_success "멤버가 댓글 생성 성공"
else
    print_error "멤버의 댓글 생성 실패 (Code: $HTTP_CODE, Body: $RESPONSE_BODY)"
fi

# 7.2: Owner fails to delete member's comment
api_call "DELETE" "$BASE_URL/api/comments/$COMMENT_ID" "" "$OWNER_TOKEN"
if [ "$HTTP_CODE" -eq 403 ]; then
    print_success "소유자가 남의 댓글 삭제 시도 실패 (403 Forbidden) - 정상 동작"
else
    print_error "소유자가 남의 댓글 삭제 시도 성공함 (예상: 403, 실제: $HTTP_CODE) - 비정상 동작"
fi

# 7.3: Member successfully deletes their own comment
api_call "DELETE" "$BASE_URL/api/comments/$COMMENT_ID" "" "$MEMBER_TOKEN"
if [ "$HTTP_CODE" -eq 204 ]; then
    print_success "멤버가 자신의 댓글 삭제 성공 (204 No Content)"
else
    print_error "멤버가 자신의 댓글 삭제 실패 (예상: 204, 실제: $HTTP_CODE)"
fi

# 7.4: Owner creates and updates a comment
owner_comment_data="{\"kanbanId\":\"$KANBAN_ID\",\"content\":\"소유자 댓글입니다. 🧑‍💻\"}"
api_call "POST" "$BASE_URL/api/comments" "$owner_comment_data" "$OWNER_TOKEN"
OWNER_COMMENT_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ "$HTTP_CODE" -eq 201 ] && [ -n "$OWNER_COMMENT_ID" ]; then
    print_success "소유자가 댓글 생성 성공"
else
    print_error "소유자의 댓글 생성 실패 (Code: $HTTP_CODE, Body: $RESPONSE_BODY)"
fi

update_comment_data="{\"content\":\"소유자 댓글 수정됨! ✨\"}"
api_call "PUT" "$BASE_URL/api/comments/$OWNER_COMMENT_ID" "$update_comment_data" "$OWNER_TOKEN"
if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "소유자가 자신의 댓글 수정 성공"
else
    print_error "소유자의 댓글 수정 실패 (예상: 200, 실제: $HTTP_CODE, Body: $RESPONSE_BODY)"
fi

# 7.5: Get comments and verify
api_call "GET" "$BASE_URL/api/comments?kanbanId=$KANBAN_ID" "" "$OWNER_TOKEN"
if [ "$HTTP_CODE" -eq 200 ] && echo "$RESPONSE_BODY" | grep -q "소유자 댓글 수정됨"; then
    print_success "댓글 목록 조회 및 수정내용 확인 성공"
else
    print_error "댓글 목록 조회 또는 내용 확인 실패 (Code: $HTTP_CODE, Body: $RESPONSE_BODY)"
fi

echo -e "\n${GREEN}🎉 모든 테스트가 성공적으로 완료되었습니다!${NC}"
