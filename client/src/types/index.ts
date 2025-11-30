// Shared TypeScript types for the client

export type Ingredient = {
  id: string;
  value: string;
  quantity: number;
  image: string;
};

export type Recipe = {
  name: string;
  image: string;
  budget: string;
  cook_time: string;
  difficulty: string;
  ingredients: string[];
  nb_comments: number;
  prep_time: string;
  rate: number;
  recipe_quantity: string;
  steps: string[];
  total_time: string;
};

export type RecipePreview = {
  name: string;
  image: string;
};

export type PageState = "home_page" | "main_page";
