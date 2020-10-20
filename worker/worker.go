package worker

type Worker struct {
	Body []string
	MaxBodyMultiplier int
	InitialMemory map[string]interface()
}

func (w Worker) run() {
}
