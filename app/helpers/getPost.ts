import path from 'path';
import { marked } from 'marked';
import prism from 'prismjs';
import fs from 'fs/promises';
import readingTime from 'reading-time';
import parseFrontMatter from 'front-matter';
import type { PostDetail } from '../types/post';

import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

type PostMarkdownAttributes = {
  title: string;
  date: string;
  shortDesc: string;
  featuredImage: string;
};

export async function getPost(slug: string): Promise<PostDetail> {
  marked.setOptions({
    highlight: function(code, lang) {
      if (prism.languages[lang]) {
        return prism.highlight(code, prism.languages[lang], lang);
      } else {
        return code;
      }
    }
  });
  const renderer = new marked.Renderer();
  renderer.image = (href, title, text) => {
    return `<img src="/assets${href}" alt="${text}" />`;
  };

  marked.setOptions({
    renderer
  });

  const postsDirectory = path.join(path.resolve('./public'), 'posts');
  const filepath = path.join(postsDirectory, slug + '.md');
  const file = await fs.readFile(filepath);
  const { attributes, body } = parseFrontMatter<PostMarkdownAttributes>(file.toString());
  const markdown = marked(body, {});
  const reading = readingTime(markdown);

  return {
    slug,
    title: attributes.title,
    date: attributes.date,
    description: attributes.shortDesc,
    featuredImage: attributes.featuredImage,
    readingTime: reading.minutes,
    body: markdown
  };
}
