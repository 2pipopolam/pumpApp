// Интерфейс для данных пользователя
export interface UserData {
  id: number;
  nickname: string;
  profilePicture: string;
}

// Базовый интерфейс для медиа-элементов (изображений и видео)
export interface MediaItem {
  id: number;
  image?: string; // URL изображения
  video?: string; // URL видео
}

// Расширенный интерфейс для медиа-элементов, включающий возможность загрузки файлов
export interface ExtendedMediaItem extends MediaItem {
  file?: File; // Файл для загрузки (изображение или видео)
}

// Интерфейс профиля, ассоциированного с постом
export interface Profile {
  id: number;
  user: number;
  avatar: string;
}

// Интерфейс поста, как он представлен в API (без файлов)
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

// Расширенный интерфейс поста для фронтенда, позволяющий включать файлы для загрузки
export interface ExtendedPost extends Omit<Post, 'images' | 'videos'> {
  images: ExtendedMediaItem[]; // Изображения с возможностью включения файлов
  videos: ExtendedMediaItem[]; // Видео с возможностью включения файлов
}

// Интерфейс для создания нового поста, без обязательных полей, таких как id, created_at и т.д.
export interface CreatePostData {
  title: string;
  training_type: string;
  description: string;
  images: File[]; // Массив файлов изображений для загрузки
  videos: File[]; // Массив файлов видео для загрузки
}

// Интерфейс для обновления существующего поста (частичное обновление)
export interface UpdatePostData {
  title?: string;
  training_type?: string;
  description?: string;
  images?: File[]; // Массив новых файлов изображений для загрузки
  videos?: File[]; // Массив новых файлов видео для загрузки
}



/*
export interface PostData extends Omit<Post, 'training_type' | 'photo' | 'video'> {
  type: string;
  media: MediaItem[];
}
*/ 
