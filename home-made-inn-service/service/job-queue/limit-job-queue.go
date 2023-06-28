package jobQueue

type LimitJobQueue struct {
	JobChan    chan Job
	maxWorkers int
}

func NewLimitJobQueue(capacity int, maxWorkers int) *LimitJobQueue {
	return &LimitJobQueue{
		JobChan:    make(chan Job, capacity),
		maxWorkers: maxWorkers,
	}
}

func (jq *LimitJobQueue) Run() {
	for i := 0; i < jq.maxWorkers; i++ {
		go jq.worker(jq.JobChan)
	}
}

func (jq *LimitJobQueue) TrySubmit(job Job) bool {
	select {
	case jq.JobChan <- job:
		return true
	default:
		return false
	}
}

func (jq *LimitJobQueue) worker(jobChan <-chan Job) {
	for job := range jobChan {
		job.Process()
	}
}
