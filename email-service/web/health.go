package web

func (s *Server) CheckHealth() map[string]map[string]string {
	health := map[string]map[string]string{}

	health["Email Service"] = make(map[string]string)
	health["Email Service"]["label"] = "OK"

	return health
}
