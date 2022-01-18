export interface Post {
  title: string;
  slug: string;
  date: string;
  featuredImage?: string;
  readingTime: number;
  description: string;
}

export interface PostDetail extends Post {
  body: string;
}
