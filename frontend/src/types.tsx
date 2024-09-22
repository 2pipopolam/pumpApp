export interface UserData {
  nickname: string;
  profilePicture: string;
}

export interface MediaItem {
  type: 'image' | 'video' | 'youtube';
  url: string;
}

export interface PostData {
  id: number;
  title: string;
  type: string;
  description: string;
  media: MediaItem[];
  views: number;
}
