package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"net/url"
	"os"
	"path/filepath"
	"strconv"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

const (
	migrationUp   = "up"
	migrationDown = "down"
	postgres      = "Postgres DB"
)

var CommandOptions = map[string]map[string]interface{}{
	"pg-uri": {
		"name":         "pg-uri",
		"defaultValue": "postgres://home_made_inn_service:1234567890@localhost:5432/home_made_inn?sslmode=disable",
		"usage":        "postgres db uri",
	},
	"files": {
		"name":         "files",
		"defaultValue": "file://db-migration/home-made-inn",
		"usage":        "postgres migrations folder",
	},
	"direction": {
		"name":         "direction",
		"defaultValue": migrationUp,
		"usage":        "migration direction: up|down",
	},
	"force-version": {
		"name":         "force-version",
		"defaultValue": "",
		"usage":        "force migration version to given version",
	},
	"step": {
		"name":         "step",
		"defaultValue": "",
		"usage":        "migration step",
	},
	"migration-down-confirmation": {
		"name":         "migration-down-confirmation",
		"defaultValue": false,
		"usage":        "Are you sure you want to drop everything?",
	},
	"version": {
		"name":         "version",
		"defaultValue": false,
		"usage":        "show active version",
	},
}

type Configuration struct {
	DBURL string `json:"db_url"`
}

func main() {
	var configFile string
	var config Configuration

	var pgUri string
	var files string
	var direction string
	var forceVersion string
	var step string
	var migrationDownConfirmation bool
	var version *bool

	flag.StringVar(&configFile, "conf", "", "affiliate service configuration")
	flag.StringVar(&pgUri, CommandOptions["pg-uri"]["name"].(string), CommandOptions["pg-uri"]["defaultValue"].(string), CommandOptions["pg-uri"]["usage"].(string))
	flag.StringVar(&files, CommandOptions["files"]["name"].(string), CommandOptions["files"]["defaultValue"].(string), CommandOptions["files"]["usage"].(string))
	flag.StringVar(&direction, CommandOptions["direction"]["name"].(string), CommandOptions["direction"]["defaultValue"].(string), CommandOptions["direction"]["usage"].(string))
	flag.StringVar(&forceVersion, CommandOptions["force-version"]["name"].(string), CommandOptions["force-version"]["defaultValue"].(string), CommandOptions["force-version"]["usage"].(string))
	flag.StringVar(&step, CommandOptions["step"]["name"].(string), CommandOptions["step"]["defaultValue"].(string), CommandOptions["step"]["usage"].(string))
	flag.BoolVar(&migrationDownConfirmation, CommandOptions["migration-down-confirmation"]["name"].(string), CommandOptions["migration-down-confirmation"]["defaultValue"].(bool), CommandOptions["migration-down-confirmation"]["usage"].(string))
	version = flag.Bool(CommandOptions["version"]["name"].(string), CommandOptions["version"]["defaultValue"].(bool), CommandOptions["version"]["usage"].(string))

	flag.Parse()

	// Load pg-uri from trade config file if any
	if configFile != "" {
		err := config.Load(configFile)
		if err != nil {
			exitWithMessage("can not open config file: %s", err.Error())
		}

		pgUri = config.DBURL
	} else {
		if pgUri == "" {
			exitWithMessage("invalid postgres db uri")
		}
	}

	if direction != migrationUp && direction != migrationDown {
		exitWithMessage("invalid migration direction")
	}

	fmt.Println("pgUri:", pgUri)
	fmt.Println("files:", files)
	fmt.Println("direction:", direction)
	fmt.Println("forceVersion:", forceVersion)
	fmt.Println("step:", step)

	if pgUri != "" {
		runMigration(files, pgUri, version, postgres, forceVersion, step, direction, migrationDownConfirmation)
	}
}

func runMigration(files, uri string, version *bool, name, forceVersion, step, direction string, migrationDownConfirmation bool) {
	if ok, err := checkDuplicationVersionInMigrationFiles(files); !ok {
		if err != nil {
			exitWithMessage("[%s]can not read migration files. %s", name, err.Error())
		} else {
			exitWithMessage("[%s]there are some duplicate versions in migration files. Please resolve the duplication of versions and run again", name)
		}
	}

	m, err := migrate.New(files, uri)
	if err != nil {
		exitWithMessage("can not initialize %s migration: %s", name, err.Error())
	}

	if *version {
		fmt.Printf("%s Migration", name)
		showVersion(m)
		return
	}

	if forceVersion != "" {
		version, err := strconv.Atoi(forceVersion)
		if err != nil {
			exitWithMessage("incorrect force version: %s", err.Error())
		}

		err = m.Force(version)
		if err != nil {
			exitWithMessage("can not execute force version for %s: %s", name, err.Error())
		}
	} else if step != "" {
		migrationStep, err := strconv.Atoi(step)
		if err != nil {
			exitWithMessage("incorrect step: %s", err.Error())
		}

		err = m.Steps(migrationStep)
		if err != nil {
			exitWithMessage("can not execute step for %s: %s", name, err.Error())
		}
	} else {
		// Reset to previous version if current migration is dirty to re-run dirty migration version
		activeVersion, dirty, err := m.Version()
		if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
			exitWithMessage("can get version", err.Error())
		}

		if dirty && activeVersion > 0 {
			// Reset to previous version
			err = m.Force(int(activeVersion) - 1)
			if err != nil {
				exitWithMessage("can not execute force version for %s: %s", name, err.Error())
			}
		}

		// Run migration
		if direction == migrationUp {
			err = m.Up()
		} else {
			if migrationDownConfirmation {
				err = m.Down()
			} else {
				fmt.Println("Are you sure you want to drop everything?. If then passing migration-down-confirmation=true to execute")
				return
			}
		}

		if err != nil && err.Error() != "no change" {
			exitWithMessage("can not migrate %s: %s", name, err.Error())
		}
	}

	fmt.Printf("Migrate %s successfully!\n", name)
	showVersion(m)
}

func (config *Configuration) Load(configFile string) error {
	f, err := os.Open(configFile)
	if err != nil {
		return err
	}
	d := json.NewDecoder(f)
	err = d.Decode(config)
	return err
}

func showVersion(m *migrate.Migrate) {
	activeVersion, dirty, err := m.Version()

	if err != nil {
		exitWithMessage("can get version", err.Error())
	}

	fmt.Printf("Active version: %d, Dirty: %t", activeVersion, dirty)
	fmt.Println()
}

func checkDuplicationVersionInMigrationFiles(filesUri string) (bool, error) {
	migrations := make(map[uint]map[source.Direction]*source.Migration)

	u, err := url.Parse(filesUri)
	if err != nil {
		return false, err
	}

	p := u.Opaque
	if len(p) == 0 {
		p = u.Host + u.Path
	}

	folderPath, err := filepath.Abs(p)
	if err != nil {
		return false, err
	}
	files, err := ioutil.ReadDir(folderPath)
	if err != nil {
		return false, err
	}

	for _, fi := range files {
		if !fi.IsDir() {
			m, err := source.DefaultParse(fi.Name())
			if err != nil {
				continue // ignore files that we can't parse
			}

			if migrations[m.Version] == nil {
				migrations[m.Version] = make(map[source.Direction]*source.Migration)
			}

			// check if duplicated versions
			if _, dup := migrations[m.Version][m.Direction]; dup {
				return false, nil
			}

			migrations[m.Version][m.Direction] = m
		}
	}

	return true, nil
}

func exitWithMessage(message string, args ...interface{}) {
	fmt.Println(fmt.Sprintf(message, args...))
	os.Exit(1)
}
