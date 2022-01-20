import readingTime from 'reading-time';
import parseFrontMatter from 'front-matter';
import fs from 'fs/promises';
import path from 'path';
import type { Post } from '../types/post';
// import allPosts from '../posts';

type PostMarkdownAttributes = {
  title: string;
  date: string;
  shortDesc: string;
  featuredImage: string;
};

function postFromModule(mod: any): Post {
  const {
    shortDesc,
    date,
    title,
  } = mod.attributes;
  return {
    slug: mod.filename.replace(/\.mdx?$/, ""),
    date,
    title,
    description: shortDesc,
    readingTime: 0
  };
}

export async function getPosts(): Promise<Post[]> {
  const pathToPosts = `${__dirname}/../../app/posts`;
  const allPostFiles = await fs.readdir(pathToPosts);
  const posts = await Promise.all(
    allPostFiles.map(async filename => {
      const file = await fs.readFile(path.join(pathToPosts, filename));
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

  
  // const dir = await fs.readdir(path.join(pathToPosts));
  // const posts = await Promise.all(
  //   dir.map(async filename => {
  //     const file = await fs.readFile(
  //       path.join(pathToPosts, filename)
  //     );
  //     const {
  //       attributes,
  //       body,
  //     } = parseFrontMatter<PostMarkdownAttributes>(file.toString());

  //     const reading = readingTime(body);

  //     return {
  //       slug: filename.replace(/\.md$/, ''),
  //       title: attributes.title,
  //       date: attributes.date,
  //       readingTime: reading.minutes,
  //       description: attributes.shortDesc
  //     };
  //   })
  // );

  // return posts.sort((a, b) => {
  //   return new Date(b.date).getTime() - new Date(a.date).getTime();
  // });
}
