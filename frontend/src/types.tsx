// types.tsx

export interface UserData {
id: number;
username: string;
profilePicture: string;
}

export interface Profile {
id: number;
user: number;
username: string;
avatar: string;
}


export interface MediaItem {
  id: number | null;
  image?: string; // URL изображения (для загруженных файлов)
  video?: string; // URL видео (для загруженных файлов)
  image_url?: string; // URL изображения по ссылке
  video_url?: string; // URL видео по ссылке
}

export interface ExtendedMediaItem extends MediaItem {
  file?: File; // Файл для загрузки (изображение или видео)
  isNew?: boolean; // Флаг, указывающий, что медиа является новым
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
  recurrence: string; // 'once' or 'weekly'
  days_of_week?: string; // Comma-separated days, e.g., 'Monday,Thursday'
}



/*
export interface PostData extends Omit<Post, 'training_type' | 'photo' | 'video'> {
  type: string;
  media: MediaItem[];
}
*/ 
