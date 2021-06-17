import Layout from '../components/layout'
import { getSession } from 'next-auth/client';

export default function Page ({ session }) {
  console.log(session);
  return (
    <Layout>
      <h1>NextAuth.js Example</h1>
      <p>
        This is an example site to demonstrate how to use <a href={`https://next-auth.js.org`}>NextAuth.js</a> for authentication.
      </p>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context)
    }
  }
}
