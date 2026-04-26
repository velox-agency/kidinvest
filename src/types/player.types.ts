export type Language = "ar" | "fr" | "en";
export type AvatarBase = "boy" | "girl";

export interface PlayerProfile {
  id: string; // UUID, generated locally on first launch
  name: string;
  age: number; // Used for difficulty scaling
  language: Language;
  avatarBase: AvatarBase;
  stage: 1 | 2;
  createdAt: string; // ISO 8601
  supabaseUserId?: string; // Only present if account created
}