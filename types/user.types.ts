export interface IProfileImage {
  url?: string;
  publicId?: string;
}

export interface UserType {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  profileImage?: IProfileImage;
  createdAt: Date;
  updatedAt: Date;
}

export type UserId = number;
