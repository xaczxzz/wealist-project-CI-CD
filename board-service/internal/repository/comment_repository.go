package repository

import (
	"board-service/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CommentRepository defines the interface for comment data operations.
type CommentRepository interface {
	Create(comment *domain.Comment) error
	FindByID(id uuid.UUID) (*domain.Comment, error)
	FindByKanbanID(kanbanID uuid.UUID) ([]domain.Comment, error)
	Update(comment *domain.Comment) error
	Delete(id uuid.UUID) error
}

type commentRepository struct {
	db *gorm.DB
}

// NewCommentRepository creates a new instance of CommentRepository.
func NewCommentRepository(db *gorm.DB) CommentRepository {
	return &commentRepository{db: db}
}

// Create adds a new comment to the database.
func (r *commentRepository) Create(comment *domain.Comment) error {
	return r.db.Create(comment).Error
}

// FindByID retrieves a comment by its ID.
func (r *commentRepository) FindByID(id uuid.UUID) (*domain.Comment, error) {
	var comment domain.Comment
	err := r.db.First(&comment, "id = ?", id).Error
	return &comment, err
}

// FindByKanbanID retrieves all comments for a given Kanban ID.
func (r *commentRepository) FindByKanbanID(kanbanID uuid.UUID) ([]domain.Comment, error) {
	var comments []domain.Comment
	err := r.db.Where("kanban_id = ?", kanbanID).Order("created_at asc").Find(&comments).Error
	return comments, err
}

// Update modifies an existing comment in the database.
func (r *commentRepository) Update(comment *domain.Comment) error {
	return r.db.Save(comment).Error
}

// Delete removes a comment from the database.
func (r *commentRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.Comment{}, "id = ?", id).Error
}
