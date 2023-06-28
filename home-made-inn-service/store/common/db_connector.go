package commonStore

import (
	"database/sql"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/plugin/dbresolver"
)

const (
	MaxOpenConnections = 200
	MaxIdleConnections = 20
)

func NewOrmDB(dbUrl, dbReadUrl string) (*gorm.DB, *sql.DB) {
	db, err := sql.Open("postgres", dbUrl)
	db.SetMaxOpenConns(MaxOpenConnections)
	db.SetMaxIdleConns(MaxIdleConnections)
	if err != nil {
		panic(err)
	}

	ormDB, err := gorm.Open(postgres.New(postgres.Config{Conn: db}), &gorm.Config{Logger: logger.Discard})
	if err != nil {
		panic(err)
	}

	var replicas []gorm.Dialector
	if dbReadUrl != "" {
		readDB, err := sql.Open("postgres", dbReadUrl)
		readDB.SetMaxOpenConns(MaxOpenConnections)
		readDB.SetMaxIdleConns(MaxIdleConnections)
		if err != nil {
			panic(err)
		}

		replicas = append(replicas, postgres.New(postgres.Config{Conn: readDB}))
	}
	ormDB.Use(dbresolver.Register(dbresolver.Config{
		Replicas: replicas,
		Policy:   dbresolver.RandomPolicy{},
	}))

	return ormDB, db
}
