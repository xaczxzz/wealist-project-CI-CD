package handler

import (
	"board-service/internal/apperrors"
	"board-service/internal/dto"
	"board-service/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CommentHandler handles HTTP requests for comments.
type CommentHandler struct {
	commentService service.CommentService
}

// NewCommentHandler creates a new instance of CommentHandler.
func NewCommentHandler(cs service.CommentService) *CommentHandler {
	return &CommentHandler{commentService: cs}
}

// CreateComment godoc
// @Summary      Create comment
// @Description  Create a new comment on a board
// @Tags         comments
// @Accept       json
// @Produce      json
// @Param        request body dto.CreateCommentRequest true "Comment details"
// @Success      201 {object} dto.SuccessResponse{data=dto.CommentResponse}
// @Failure      400 {object} dto.ErrorResponse
// @Failure      403 {object} dto.ErrorResponse
// @Failure      404 {object} dto.ErrorResponse
// @Router       /api/comments [post]
// @Security     BearerAuth
func (h *CommentHandler) CreateComment(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		dto.Error(c, apperrors.New(apperrors.ErrCodeBadRequest, "Invalid user ID format", http.StatusBadRequest))
		return
	}

	var req dto.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		dto.Error(c, apperrors.Wrap(err, apperrors.ErrCodeValidation, "Invalid request body", http.StatusBadRequest))
		return
	}

	resp, err := h.commentService.CreateComment(c.Request.Context(), req, userID)
	if err != nil {
		if appErr, ok := err.(*apperrors.AppError); ok {
			dto.Error(c, appErr)
		} else {
			dto.Error(c, apperrors.ErrInternalServer)
		}
		return
	}

	dto.SuccessWithStatus(c, http.StatusCreated, resp)
}

// GetCommentsByBoardID godoc
// @Summary      Get comments by board
// @Description  Get all comments for a specific board (project member only)
// @Tags         comments
// @Accept       json
// @Produce      json
// @Param        boardId query string true "Board ID"
// @Success      200 {object} dto.SuccessResponse{data=[]dto.CommentResponse}
// @Failure      400 {object} dto.ErrorResponse
// @Failure      403 {object} dto.ErrorResponse
// @Failure      404 {object} dto.ErrorResponse
// @Router       /api/comments [get]
// @Security     BearerAuth
func (h *CommentHandler) GetCommentsByBoardID(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		dto.Error(c, apperrors.New(apperrors.ErrCodeBadRequest, "Invalid user ID format", http.StatusBadRequest))
		return
	}

	boardIDStr := c.Query("boardId")
	if boardIDStr == "" {
		dto.Error(c, apperrors.New(apperrors.ErrCodeBadRequest, "boardId query parameter is required", http.StatusBadRequest))
		return
	}

	boardID, err := uuid.Parse(boardIDStr)
	if err != nil {
		dto.Error(c, apperrors.New(apperrors.ErrCodeBadRequest, "Invalid board ID format", http.StatusBadRequest))
		return
	}

	resp, err := h.commentService.GetCommentsByBoardID(c.Request.Context(), boardID, userID)
	if err != nil {
		if appErr, ok := err.(*apperrors.AppError); ok {
			dto.Error(c, appErr)
		} else {
			dto.Error(c, apperrors.ErrInternalServer)
		}
		return
	}

	dto.Success(c, resp)
}

// UpdateComment godoc
// @Summary      Update comment
// @Description  Update an existing comment (author only)
// @Tags         comments
// @Accept       json
// @Produce      json
// @Param        commentId path string true "Comment ID"
// @Param        request body dto.UpdateCommentRequest true "Comment updates"
// @Success      200 {object} dto.SuccessResponse{data=dto.CommentResponse}
// @Failure      400 {object} dto.ErrorResponse
// @Failure      403 {object} dto.ErrorResponse
// @Failure      404 {object} dto.ErrorResponse
// @Router       /api/comments/{commentId} [put]
// @Security     BearerAuth
func (h *CommentHandler) UpdateComment(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		dto.Error(c, apperrors.New(apperrors.ErrCodeBadRequest, "Invalid user ID format", http.StatusBadRequest))
		return
	}

	commentID, err := uuid.Parse(c.Param("commentId"))
	if err != nil {
		dto.Error(c, apperrors.New(apperrors.ErrCodeBadRequest, "Invalid comment ID format", http.StatusBadRequest))
		return
	}

	var req dto.UpdateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		dto.Error(c, apperrors.Wrap(err, apperrors.ErrCodeValidation, "Invalid request body", http.StatusBadRequest))
		return
	}

	resp, err := h.commentService.UpdateComment(c.Request.Context(), commentID, req, userID)
	if err != nil {
		if appErr, ok := err.(*apperrors.AppError); ok {
			dto.Error(c, appErr)
		} else {
			dto.Error(c, apperrors.ErrInternalServer)
		}
		return
	}

	dto.Success(c, resp)
}

// DeleteComment godoc
// @Summary      Delete comment
// @Description  Delete a comment (soft delete, author only)
// @Tags         comments
// @Accept       json
// @Produce      json
// @Param        commentId path string true "Comment ID"
// @Success      204 "No Content"
// @Failure      400 {object} dto.ErrorResponse
// @Failure      403 {object} dto.ErrorResponse
// @Failure      404 {object} dto.ErrorResponse
// @Router       /api/comments/{commentId} [delete]
// @Security     BearerAuth
func (h *CommentHandler) DeleteComment(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		dto.Error(c, apperrors.New(apperrors.ErrCodeBadRequest, "Invalid user ID format", http.StatusBadRequest))
		return
	}

	commentID, err := uuid.Parse(c.Param("commentId"))
	if err != nil {
		dto.Error(c, apperrors.New(apperrors.ErrCodeBadRequest, "Invalid comment ID format", http.StatusBadRequest))
		return
	}

	if err := h.commentService.DeleteComment(c.Request.Context(), commentID, userID); err != nil {
		if appErr, ok := err.(*apperrors.AppError); ok {
			dto.Error(c, appErr)
		} else {
			dto.Error(c, apperrors.ErrInternalServer)
		}
		return
	}

	c.Status(http.StatusNoContent)
}
