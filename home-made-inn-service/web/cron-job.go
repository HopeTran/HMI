package web

import (
	"strings"
	"time"

	"gopkg.in/robfig/cron.v2"

	"home-made-inn-service/model"
)

func (s *Server) StartCronJobs() {
	s.startScheduleMenuCronJob()
}

func (s *Server) startScheduleMenuCronJob() {
	cronJob := cron.New()
	// run 1:00 AM every day
	cronJob.AddFunc("TZ=UTC 0 1 * * *", func() {
		yesterday := strings.ToLower(time.Now().AddDate(0, 0, -1).Format("Mon"))
		s.log.Info("Schedule menus reset data: weekDay= ", yesterday)
		s.dbStore.ResetScheduleMenu(model.WeekDay(yesterday))
	})
	cronJob.Start()
	s.log.Info("Schedule menu cron job running...")
}
