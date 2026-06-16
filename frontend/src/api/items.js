import api from "./client"

export const getItems = (params) => api.get("/api/items", { params }).then(r => r.data)
export const getItem = (id) => api.get(`/api/items/${id}`).then(r => r.data)
export const createItem = (formData) => api.post("/api/items", formData, {
  headers: { "Content-Type": "multipart/form-data" }
}).then(r => r.data)
export const updateItemStatus = (id, status) => api.patch(`/api/items/${id}/status`, { status }).then(r => r.data)
export const deleteItem = (id) => api.delete(`/api/items/${id}`).then(r => r.data)
