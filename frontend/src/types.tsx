// types.tsx

export interface UserData {
  id: number;
  nickname: string;
  profilePicture: string;
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

export interface Profile {
  id: number;
  user: number;
  avatar: string;
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




/*
export interface PostData extends Omit<Post, 'training_type' | 'photo' | 'video'> {
  type: string;
  media: MediaItem[];
}
*/ 
