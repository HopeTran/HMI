package dbStore

import (
	"database/sql"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"

	commonStore "home-made-inn-service/store/common"
)

type DBStore struct {
	log   *logrus.Entry
	db    *sql.DB
	ormDB *gorm.DB
}

func NewDBStore(dbUrl string, dbReadUrl string, dbMock ...string) *DBStore {
	if len(dbMock) != 0 {
		dbUrl = dbMock[0]
	}

	ormDB, db := commonStore.NewOrmDB(dbUrl, dbReadUrl)

	result := &DBStore{
		log:   logrus.WithField("prefix", "[home-made-inn]postgres"),
		db:    db,
		ormDB: ormDB,
	}

	return result
}

func (d *DBStore) BeginAndCommit(callback func(tx *gorm.DB) error) error {
	tx := d.ormDB.Begin()

	if err := callback(tx); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (d *DBStore) BeginAndCommitThenReturn(callback func(tx *gorm.DB) (interface{}, error)) (interface{}, error) {
	tx := d.ormDB.Begin()
	result, err := callback(tx)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	return result, tx.Commit().Error
}

func (d *DBStore) GetTx() *gorm.DB {
	return d.ormDB
}
