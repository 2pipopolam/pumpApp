export interface MediaItem {
  id: number;
  image?: string;
  video?: string;
}

export interface Profile {
  id: number;
  user: number;
  avatar: string;
}

export interface Post {
  id: number;
  title: string;
  images: MediaItem[];
  videos: MediaItem[];
  training_type: string;
  description: string;
  views: number;
  created_at: string;
  updated_at: string;
  profile: Profile;
}

export interface UserData {
  id: number;
  nickname: string;
  profilePicture: string;
}


/*
export interface PostData extends Omit<Post, 'training_type' | 'photo' | 'video'> {
  type: string;
  media: MediaItem[];
}
*/ 
