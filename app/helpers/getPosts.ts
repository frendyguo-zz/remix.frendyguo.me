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

const publicPath = path.resolve('.', 'public');

export async function getPosts(): Promise<Post[]> {
  console.log('READDIR', await fs.readdir(path.join(path.resolve('.'), 'output')));
  const dir = await fs.readdir(path.join(publicPath, 'posts'));
  const posts = await Promise.all(
    dir.map(async filename => {
      const file = await fs.readFile(
        path.join(publicPath, 'posts', filename)
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
