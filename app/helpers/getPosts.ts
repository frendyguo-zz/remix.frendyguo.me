import path from 'path';
import fs from 'fs/promises';
import readingTime from 'reading-time';
import parseFrontMatter from 'front-matter';
import type { Post } from '../types/post';

type PostMarkdownAttributes = {
  title: string;
  date: string;
  shortDesc: string;
  featuredImage: string;
};

const postsPath = path.join(__dirname, '/../../app/posts');

export async function getPosts(): Promise<Post[]> {
  console.log('READ DIR' + await fs.readdir('.'));
  const dir = await fs.readdir(postsPath);
  console.log('dir', dir);
  const posts = await Promise.all(
    dir.map(async filename => {
      const file = await fs.readFile(
        path.join(postsPath, filename)
      );
      const {
        attributes,
        body,
      } = parseFrontMatter<PostMarkdownAttributes>(file.toString());

      const reading = readingTime(body);

      return {
        slug: filename.replace(/\.md$/, ''),
        title: attributes.title,
        date: attributes.date,
        readingTime: reading.minutes,
        description: attributes.shortDesc
      };
    })
  );

  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
