// src/services/api.ts

import axios, { AxiosResponse } from 'axios';
import { MediaItem, Post, Profile, TrainingSession } from '../types';

export const API_URL = 'http://localhost:8000/api/';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // куки
});

// Request interceptor to add access tokens
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

// API Functions
export const getProfile = () => api.get('/user-profile/');
export const updateProfile = (data: FormData) => api.put('/profiles/me/', data);

// Updated to accept query parameters
export const getMyPosts = (params?: any): Promise<AxiosResponse<Post[]>> =>
  api.get('/posts/', { params: { mine: 'true', ...params } });


export const getAllPosts = (params?: any): Promise<AxiosResponse<Post[]>> =>
  api.get('/posts/', { params: { exclude_mine:true } });



export const createPost = (data: FormData) => api.post('/posts/', data);
export const updatePost = (id: number, data: FormData) => api.put(`/posts/${id}/`, data);
export const deletePost = (id: number) => api.delete(`/posts/${id}/`);

// Registration and Token Functions
export const register = (data: any) => api.post('/register/', data);
export const obtainToken = (data: any) => api.post('/token/', data);
export const refreshToken = (refresh: string) => api.post('/token/refresh/', { refresh });

// TrainingSession Functions
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

// Telegram Linking Functions
export const linkTelegram = () => {
  return api.post('/link-telegram/');
};

export const checkTelegramLink = () => {
  return api.get('/link-telegram/status/');
};

export const confirmLinkTelegram = (code: string, telegramUserId: string) => {
  return api.post('/link-telegram/confirm/', { code, telegram_user_id: telegramUserId });
};
