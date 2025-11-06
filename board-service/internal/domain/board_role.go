package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BoardRole struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BoardID      uuid.UUID `gorm:"type:uuid;not null;index;uniqueIndex:idx_board_custom_role" json:"board_id"`
	CustomRoleID uuid.UUID `gorm:"type:uuid;not null;index;uniqueIndex:idx_board_custom_role" json:"custom_role_id"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (BoardRole) TableName() string {
	return "board_roles"
}

// BeforeCreate is a GORM hook that generates UUID before creating a record
func (br *BoardRole) BeforeCreate(tx *gorm.DB) error {
	if br.ID == uuid.Nil {
		br.ID = uuid.New()
	}
	return nil
}
