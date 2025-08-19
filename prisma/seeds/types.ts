export type Environment = 'test' | 'development' | 'staging' | 'production';

export interface VerifiedUserData {
  username: string;
  email: string;
  displayName: string;
  bio: string;
}

export interface SeedingStats {
  users: number;
  tweets: number;
  follows: number;
  likes: number;
}
