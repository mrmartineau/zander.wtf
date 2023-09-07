declare module 'letterboxd' {
  export interface Entry {
    type: string;
    date: DateInfo;
    film?: Film;
    rating?: Rating;
    review?: string;
    spoilers?: boolean;
    isRewatch?: boolean;
    uri: string;
    title?: string;
    description?: string;
    ranked?: boolean;
    films?: Film2[];
    totalFilms?: number;
  }

  export interface DateInfo {
    published: number;
    watched?: number;
  }

  export interface Film {
    title: string;
    year: string;
    image: Image;
  }

  export interface Image {
    tiny: string;
    small: string;
    medium: string;
    large: string;
  }

  export interface Rating {
    text: string;
    score: number;
  }

  export interface Film2 {
    title: string;
    uri: string;
  }

  const letterboxd: (username: string) => Promise<Entry[]>;
  export default letterboxd;
}
