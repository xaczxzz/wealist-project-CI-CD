package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Comment represents a comment on a Kanban card.
type Comment struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Content   string         `gorm:"type:text;not null"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index"`
	KanbanID  uuid.UUID      `gorm:"type:uuid;not null;index"`
	Kanban    Kanban         `gorm:"foreignKey:KanbanID"`
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// TableName specifies the table name for the Comment model.
func (Comment) TableName() string {
	return "comments"
}

// BeforeCreate is a GORM hook that generates a UUID before creating a record.
func (c *Comment) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}
