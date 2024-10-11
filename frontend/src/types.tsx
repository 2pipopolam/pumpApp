// types.tsx

export interface UserData {
  id: number;
  username: string;
  email: string;
  profilePicture: string;
}

export interface Profile {
  id: number;
  user: number;
  username: string;
  email: string;
  avatar: string;
}


export interface MediaItem {
  id: number | null;
  image?: string;   
  video?: string; 
  image_url?: string; 
  video_url?: string; 
}

export interface ExtendedMediaItem extends MediaItem {
  file?: File; // Файл для загрузки (изображение или видео)
  isNew?: boolean; 
}


export interface Post {
  id: number;
  title: string;
  training_type: string;
  description: string;
  images: MediaItem[]; // Список изображений с URL
  videos: MediaItem[]; // Список видео с URL
  views: number;
  created_at: string;
  updated_at: string;
  profile: Profile;
}

export interface ExtendedPost extends Omit<Post, 'images' | 'videos'> {
  images: ExtendedMediaItem[]; // Изображения с возможностью включения файлов
  videos: ExtendedMediaItem[]; // Видео с возможностью включения файлов
}


export interface TrainingSession {
  id: number;
  date: string; // ISO format date
  time: string; // ISO format time
  recurrence: string;   
  days_of_week?: string; 
}


export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
}
