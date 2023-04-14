import Head from "next/head"
import { useRouter } from "next/router"
import { API, Amplify, withSSRContext } from "aws-amplify"

import awsExports from "../../src/aws-exports"
import { deletePost } from "../../src/graphql/mutations"
import { getPost, listPosts } from "../../src/graphql/queries"
import { Button } from "@/components/ui/button"

Amplify.configure({ ...awsExports, ssr: true })

export async function getServerSideProps({ req, params }) {
  const SSR = withSSRContext({ req })
  const { data } = await SSR.API.graphql({
    query: getPost,
    variables: {
      id: params.id,
    },
  })
  return {
    props: {
      post: data.getPost,
    },
  }
}

export default function Post({ post }) {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <div className="container mx-auto">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Loading&hellip;</h1>
      </div>
    )
  }

  async function handleDelete() {
    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: deletePost,
        variables: {
          input: { id: post.id },
        },
      })

      window.location.href = "/"
    } catch ({ errors }) {
      console.error(...errors)
      throw new Error(errors[0].message)
    }
  }

  return (
    <div className="conainer mx-auto">
      <Head>
        <title>{post.title} – Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>

        <p className="leading-7 [&:not(:first-child)]:mt-6">{post.content}</p>
      </main>

      <footer className="container mx-auto">
        <Button onClick={handleDelete}>💥 Delete post</Button>
      </footer>
    </div>
  )
}
