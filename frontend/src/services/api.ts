import axios, { AxiosResponse } from 'axios';
import { MediaItem , Post , Profile, TrainingSession } from '../types';

export const API_URL =  'http://localhost:8000/api/';

export const api = axios.create({
  baseURL: API_URL,
});

// Добавляем перехватчик запросов для добавления токенов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Функции API
export const getProfile = () => api.get('/user-profile/');
export const updateProfile = (data: FormData) => api.put('/profiles/me/', data);
export const getPosts = () => api.get('/posts/');
export const createPost = (data: FormData) => api.post('/posts/', data);
export const updatePost = (id: number, data: FormData) => api.put(`/posts/${id}/`, data);
export const deletePost = (id: number) => api.delete(`/posts/${id}/`);

// Функции для регистрации и получения токенов
export const register = (data: any) => api.post('/register/', data);
export const obtainToken = (data: any) => api.post('/token/', data);

// Обновление токенов
export const refreshToken = (refresh: string) => api.post('/token/refresh/', { refresh });


//TrainingSession

export const getTrainingSessions = (): Promise<AxiosResponse<TrainingSession[]>> =>
  api.get(`/training-sessions/`);

export const createTrainingSession = (
  data: Partial<TrainingSession>
): Promise<AxiosResponse<TrainingSession>> => api.post(`/training-sessions/`, data);

export const updateTrainingSession = (
  id: number,
  data: Partial<TrainingSession>
): Promise<AxiosResponse<TrainingSession>> => api.patch(`/training-sessions/${id}/`, data);

export const deleteTrainingSession = (id: number): Promise<AxiosResponse<void>> =>
  api.delete(`/training-sessions/${id}/`);
