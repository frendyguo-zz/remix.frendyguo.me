import type { LoaderFunction } from "remix";
import { useLoaderData, json, Link } from "remix";
import { getPosts } from "~/helpers/getPosts";
import Post, { links as styles } from '../components/Post';
import type { PostProps } from '../components/Post/types';

type IndexData = {
  posts: PostProps[];
};

export function links() {
  return [
    ...styles()
  ];
};

export let loader: LoaderFunction = async () => {
  try {
    const posts = await getPosts();
    let data: IndexData = {
      posts
    };

    return json(data); 
  } catch (e) {
    console.log(e);
    throw new Response("Internal server error!", {
      status: 500
    });
  }
};

export default function Index() {
  let data = useLoaderData<IndexData>();

  return (
    <div className="px-4 font-default text-neutral-500 dark:text-white mx-auto tablet:px-0 tablet:max-w-2xl laptop:max-w-2xl">
      <h1 className="text-3xl text-left text-opacity-relax mt-4 tablet:text-3xl tablet:mt-10">
        <strong>Hi</strong> 👋, I'm <strong>Frendy Guo</strong>
      </h1>
      <p className="text-xl leading-relaxed mt-4 text-opacity-relax tablet:text-lg">I'm a <strong>Frontend Engineer</strong> from <strong>Indonesia</strong>. I mainly work with <a className="underline visited:underline" href="https://reactjs.org/">React</a> and <a className="underline visited:underline" href="https://www.typescriptlang.org/">Typescript</a>. Welcome to my <strong>personal website</strong>. This is where I share my thoughts about the latest web technologies.</p>
      <p className="text-xl leading-relaxed mt-3 text-opacity-relax tablet:text-lg">I enjoy writing occassionally, <strong>you can find the latest things I wrote here:</strong></p>
      <section className="mt-4 tablet:mt-6">
        {data.posts.map(post => (
          <Post
            key={post.slug}
            title={post.title}
            slug={post.slug}
            date={post.date}
            readingTime={post.readingTime}
            description={post.description}
          />
        ))}
      </section>
    </div>
  );
}
