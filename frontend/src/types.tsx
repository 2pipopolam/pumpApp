export interface UserData {
  id: number;
  nickname: string;
  profilePicture: string;
}

export interface MediaItem {
  type: 'image' | 'video' | 'youtube';
  url: string;
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
  photo: string;
  video: string;
  views: number;
  created_at: string;
  updated_at: string;
  profile: Profile;
}

/*
export interface PostData extends Omit<Post, 'training_type' | 'photo' | 'video'> {
  type: string;
  media: MediaItem[];
}
*/
