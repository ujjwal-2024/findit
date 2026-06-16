import api from "./client"

export const getMatches = () => api.get("/api/matches").then(r => r.data)
export const getMatch = (id) => api.get(`/api/matches/${id}`).then(r => r.data)
