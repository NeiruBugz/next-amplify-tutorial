import Head from "next/head"
import { Authenticator } from "@aws-amplify/ui-react"
import { API, Amplify, Auth, withSSRContext } from "aws-amplify"

import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Layout } from '@/components/layout';
import awsExports from "../src/aws-exports"
import { createPost } from "../src/graphql/mutations"
import { listPosts } from "../src/graphql/queries"

Amplify.configure({ ...awsExports, ssr: true })

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req })

  try {
    const response = await SSR.API.graphql({
      query: listPosts,
      authMode: "API_KEY",
    })
    return {
      props: {
        posts: response.data.listPosts.items,
      },
    }
  } catch (error) {
    console.error(error)
    return {
      props: {},
    }
  }
}

async function handleCreatePost(event) {
  event.preventDefault()

  const form = new FormData(event.target)

  try {
    //@ts-ignore
    const { data } = await API.graphql({
      authMode: "AMAZON_COGNITO_USER_POOLS",
      query: createPost,
      variables: {
        input: {
          title: form.get("title"),
          content: form.get("content"),
        },
      },
    })

    window.location.href = `/posts/${data.createPost.id}`
  } catch ({ errors }) {
    console.error(...errors)
    throw new Error(errors[0].message)
  }
}

export default function Home({ posts = [] }) {
  return (
    <Layout>
      <Head>
        <title>Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Amplify + Next.js
        </h1>

        <p className="leading-7 [&:not(:first-child)]:mt-6">
          <code className="relative rounded bg-slate-100 py-[0.2rem] px-[0.3rem] font-mono text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-400">
            {posts.length}
          </code>
          posts
        </p>

        <div>
          {posts.map((post) => (
            <a href={`/posts/${post.id}`} key={post.id}>
              <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">{post.title}</h3>
              <p className="leading-7 [&:not(:first-child)]:mt-6">{post.content}</p>
            </a>
          ))}

          <div>
            <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">New Post</h3>

            <Authenticator>
              <form onSubmit={handleCreatePost}>
                <fieldset>
                  <legend>Title</legend>
                  <Input
                    defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
                    name="title"
                  />
                </fieldset>

                <fieldset>
                  <legend>Content</legend>
                  <Textarea
                    defaultValue="I built an Amplify project with Next.js!"
                    name="content"
                  />
                </fieldset>

                <Button variant="outline">Create Post</Button>
                <Button type="button" onClick={() => Auth.signOut()}>
                  Sign out
                </Button>
              </form>
            </Authenticator>
          </div>
        </div>
      </main>
    </Layout>
  )
}
