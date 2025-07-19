import { ReactNode } from "react";

export interface Dhikr {
  id: number;
  categoryId: string;
  subcategoryId?: string;
  arabic: string;
  translation: string;
  distractorTranslations: string[];
  transliteration: string;
  virtue: string;
  audioUrl: string;
  points: number;
  scrambleChunks?: string[];
}

export interface Subcategory {
  id: string;
  title: string;
  subtitle: string;
  dhikrIds: number[];
}

export interface Category {
  id: string;
  title: string;
  subtitle: string;
  icon: (props: { className?: string }) => ReactNode;
  color: string;
  subcategories: Subcategory[];
}

export interface Progress {
  [categoryId: string]: {
    completedStages: { [dhikrId: number]: number }; // dhikrId -> highest stage completed (e.g., 4)
    completedReviews: { [reviewId: string]: boolean };
    score: number;
  };
}
