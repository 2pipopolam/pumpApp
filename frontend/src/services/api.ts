import axios, { AxiosResponse } from 'axios';
import { MediaItem , Post , Profile, TrainingSession } from '../types';

export const API_URL = 'http://localhost:8000/api';


export const api = axios.create({
  baseURL: API_URL,
  // auth: {
  //   username: 'pipopolam',
  //   password: 'abc123shws'
  // }
});


// interceptor JWT токена в заголовки 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// Регистрация
export const register = (data: { username: string; email: string; password: string; password2: string; }): Promise<AxiosResponse<any>> =>
  api.post('/register/', data);

// Логин
export const login = (data: { username: string; password: string; }): Promise<AxiosResponse<any>> =>
  api.post('/login/', data);

// Получение токенов
export const obtainToken = (data: { username: string; password: string; }): Promise<AxiosResponse<any>> =>
  api.post('/token/', data);

// Обновление токенов
export const refreshToken = (data: { refresh: string; }): Promise<AxiosResponse<any>> =>
  api.post('/token/refresh/', data);


//Post
export const getPosts = (): Promise<AxiosResponse<Post[]>> => 
  api.get(`${API_URL}/posts/`);

export const getPost = (id: number): Promise<AxiosResponse<Post>> => 
  api.get(`${API_URL}/posts/${id}/`);

export const createPost = (formData: FormData): Promise<AxiosResponse<Post>> =>
  api.post(`/posts/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const updatePost = (id: number, formData: FormData): Promise<AxiosResponse<Post>> =>
  api.patch(`/posts/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const deletePost = (id: number): Promise<AxiosResponse<void>> =>
  api.delete(`/posts/${id}/`);


//Profile
export const getProfile = (): Promise<AxiosResponse<Profile>> =>
  api.get(`/profiles/me/`);

export const updateProfile = (formData: FormData): Promise<AxiosResponse<Profile>> =>
  api.patch(`/profiles/me/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const getProfiles = (): Promise<AxiosResponse<Profile[]>> => 
  api.get(`${API_URL}/profiles/`);


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
