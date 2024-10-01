import axios, { AxiosResponse } from 'axios';
import { MediaItem , Post , Profile, TrainingSession } from '../types';
const API_URL = 'http://localhost:8000/api';


const api = axios.create({
  baseURL: API_URL,
  auth: {
    username: 'pipopolam',
    password: 'abc123shws'
  }
});



export const getPosts = (): Promise<AxiosResponse<Post[]>> => 
  api.get(`${API_URL}/posts/`);

export const getPost = (id: number): Promise<AxiosResponse<Post>> => 
  api.get(`${API_URL}/posts/${id}/`);


// export const createPost = (postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'views'>): Promise<AxiosResponse<Post>> => 
//   api.post(`${API_URL}/posts/`, postData);


// export const updatePost = (id: number, postData: Partial<Post>): Promise<AxiosResponse<Post>> => 
//   api.put(`${API_URL}/posts/${id}/`, postData);


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
