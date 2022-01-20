import type { LoaderFunction, MetaFunction } from "remix";
import { useLoaderData, json } from "remix";
import dayjs from 'dayjs';
import { getPost } from "~/helpers/getPost";
import { PostDetail } from "~/types/post";
import config from "~/config";

type PostDetailData = {
  post: PostDetail;
  canonical?: string;
}

export let meta: MetaFunction = ({ data }: { data: PostDetailData }) => {
  if (!data || !data.post) return {};

  const { post } = data;
  const title = `${post.title} | Frendy Guo`;
  const image = `/assets${post.featuredImage}`;
  const desc = `${post.description}`;
  const siteVerification = config.googleSiteVerification;

  return {
    title,
    'og:title': title,
    description: desc,
    'og:description': desc,
    url: config.siteUrl,
    'og:type': 'website',
    'google-site-verification': siteVerification,
    'og:image': image,
    'twitter:image': image
  };
};

export let loader: LoaderFunction = async ({ params }) => {
  try {
    const post = await getPost(params.slug || '');
    let data: PostDetailData = {
      post,
      canonical: `https://frendyguo.me/${params.slug}`
    };
  
    return json(data);
  } catch (e) {
    console.log(e);
    throw new Response("Not Found", {
      status: 404
    });
  }
};

const PostDetail = () => {
  const { post } = useLoaderData<PostDetailData>();
  
  return (
    <div className="text-neutral-500 dark:text-white text-opacity-relax px-4 mx-auto tablet:px-0 tablet:max-w-2xl laptop:max-w-3xl">
      <div className="mt-2 tablet:mt-8">
        <h1 className="text-left text-3xl leading-relaxed font-bold mx-auto tablet:text-4xl tablet:text-center tablet:max-w-xl tablet:leading-snug">{post.title}</h1>
        <time className="block text-xs text-left mt-2 tablet:text-center tablet:mt-4">
          { dayjs(post.date).format('DD MMMM YYYY') } - {Math.round(post.readingTime)} min(s) read
        </time> 
        <div className="prose prose-lg font-default laptop:prose-base max-w-full dark:prose-invert pb-12 mt-4 tablet:mt-8 tablet:border-t-2 tablet:border-t-dark/[.87] dark:tablet:border-t-white/[.87] tablet:pt-4 mx-auto tablet:max-w-xl"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </div>
    </div>
  );
};

export default PostDetail;
