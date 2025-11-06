package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Board struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProjectID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"project_id"`
	Title        string         `gorm:"type:varchar(200);not null" json:"title"`
	Content      string         `gorm:"type:text" json:"content"`
	StageID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"stage_id"`
	ImportanceID *uuid.UUID     `gorm:"type:uuid;index" json:"importance_id"`
	AssigneeID   *uuid.UUID     `gorm:"type:uuid;index" json:"assignee_id"`
	AuthorID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"author_id"`
	DueDate      *time.Time     `gorm:"index" json:"due_date"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

func (Board) TableName() string {
	return "boards"
}

// BeforeCreate is a GORM hook that generates UUID before creating a record
func (b *Board) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}
