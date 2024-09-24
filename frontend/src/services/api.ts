import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:8000/api';


const api = axios.create({
  baseURL: API_URL,
  auth: {
    username: 'pipopolam',
    password: 'abc123shws'
  }
});


export interface Post {
  id: number;
  title: string;
  training_type: string;
  description: string;
  photo: string;
  video: string;
  views: number;
  created_at: string;
  updated_at: string;
  profile: {
    id: number;
    user: number;
    avatar: string;
  };
}

export interface Profile {
  id: number;
  user: number;
  avatar: string;
}

export const getPosts = (): Promise<AxiosResponse<Post[]>> => 
  api.get(`${API_URL}/posts/`);

export const getPost = (id: number): Promise<AxiosResponse<Post>> => 
  api.get(`${API_URL}/posts/${id}/`);

export const createPost = (postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'views'>): Promise<AxiosResponse<Post>> => 
  api.post(`${API_URL}/posts/`, postData);

export const updatePost = (id: number, postData: Partial<Post>): Promise<AxiosResponse<Post>> => 
  api.put(`${API_URL}/posts/${id}/`, postData);

export const deletePost = (id: number): Promise<AxiosResponse<void>> => 
  api.delete(`${API_URL}/posts/${id}/`);

export const getProfiles = (): Promise<AxiosResponse<Profile[]>> => 
  api.get(`${API_URL}/profiles/`);

export const getProfile = (id: number): Promise<AxiosResponse<Profile>> => 
  api.get(`${API_URL}/profiles/${id}/`);

export const updateProfile = (id: number, profileData: Partial<Profile>): Promise<AxiosResponse<Profile>> => 
  api.put(`${API_URL}/profiles/${id}/`, profileData);
