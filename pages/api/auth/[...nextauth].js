import NextAuth from "next-auth"
import Providers from "next-auth/providers"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  // https://next-auth.js.org/configuration/providers
  providers: [
    Providers.Kakao({
      clientId: process.env.KAKAO_ID,
      clientSecret: process.env.KAKAO_SECRET,
    }),
    // email-password와 같은 일반적인 로그인 방식을 위한 Credentials Provider
    Providers.Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "E-mail", type: "text", placeholder: "minsu@publy.co" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const { email, password } = credentials;

        // 여기서 게이트웨이로 로그인 요청을 보내서 accessToken을 받아오는 등의 행동을 할 수 있음
        const user = await validateCredentials(email, password);
        console.log({ email, password, user });

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user
        } else {
          // If you return null or false then the credentials will be rejected
          return null
          // You can also Reject this callback with an Error or with a URL:
          // throw new Error('error message') // Redirect to error page
          // throw '/path/to/redirect'        // Redirect to a URL
        }
      }
    })
  ],
  // The secret should be set to a reasonably long random string.
  // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
  // a separate secret is defined explicitly for encrypting the JWT.
  secret: process.env.SECRET,

  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `jwt` is automatically set to `true` if no database is specified.
    jwt: true,

    // Seconds - How long until an idle session expires and is no longer valid.
    // maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // JSON Web tokens are only used for sessions if the `jwt: true` session
  // option is set - or by default if no database is specified.
  // https://next-auth.js.org/configuration/options#jwt
  jwt: {
    // A secret to use for key generation (you should set this explicitly)
    secret: process.env.JWT_SECRET,
    // Set to true to use encryption (default: false)
    encryption: false,
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
  },

  // You can define custom pages to override the built-in ones. These will be regular Next.js pages
  // so ensure that they are placed outside of the '/api' folder, e.g. signIn: '/auth/mycustom-signin'
  // The routes shown here are the default URLs that will be used when a custom
  // pages is not specified for that route.
  // https://next-auth.js.org/configuration/pages
  pages: {
    // signIn: '/auth/signin',  // Displays signin buttons
    // signOut: '/auth/signout', // Displays form with sign out button
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },

  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    // 사용자 로그인 여부를 결정
    async signIn(user, account, profile) {
      /*
        Credentials Provider 사용시
        user 객체는 authorize 콜백에서 반환한 것
        Profile은 HTTP POST 요청의 raw body

        다른 OAuth Provider 사용시 해당 서비스에서
        제공하는 값들로 채워져서 옴
        
        단, 인가코드를 받아오는 걸로 끝나는게 아니라 
        토큰을 받아오는 과정또한 포함됩니다

        받아온 데이터들을 통해 게이트웨이로
        소셜계정 - 기존계정 연결하는 요청을 해야할듯

        account 객체에 어떤 provider인지 나와있음
      */
      console.log({ user, account, profile });
      try {
          return true;
      } catch (e) {
          return false;
      }
    },
    // 사용자가 콜백 URL로 리다이렉트 될 때 호출(로그인/로그아웃)
    async redirect(url, baseUrl) {
      // 콜백 URL로 지정된 url, 사이트의 기본 baseUrl을 파라미터로 받아서, 리다이렉트 경로 지정 가능
      return url.startsWith(baseUrl)
        ? url
        : baseUrl
    },
    // 세션이 체크될 때마다 호출, jwt() 콜백이 먼저 호출됨
    async session(session, token) {
      try {
        // 토큰에 저장된 유저 데이터를 그대로 갖다 쓰도록 할 수 있음
        session.user = token.user;

        return session;
      } catch (e) {
        return true;
      }
    },
    // JWT가 만들어지거나(로그인 등), 업데이트 되었을 때 호출
    async jwt(token, user, account, profile, isNewUser) {
      /* 
        user, account, profile, isNewUser의 경우
        Provider에 따라서 undefined일 수 있음
      */
      if (!token.user) {
        token.user = user;
      }

      return token
    },
  },

  // Events are useful for logging
  // https://next-auth.js.org/configuration/events
  events: {
    async signIn(message) {
      console.log('After sign in');
      // console.log(message);
    },
    async signOut(message) {
      console.log('After sign out');
      // console.log(message);
    },
    async session(message) {
      console.log('After end of request')
      // console.log(message);
    },
    async error(message) {
      console.log('Error');
      // console.log(message);
    }
  },
  
  // You can set the theme to 'light', 'dark' or use 'auto' to default to the
  // whatever prefers-color-scheme is set to in the browser. Default is 'auto'
  theme: 'light',

  // Enable debug messages in the console if you are having problems
  debug: false,
})

const users = [
  {
    id: 1,
    email: 'minsu@publy.co',
    age: 27
  }
]

async function validateCredentials(email, password) {
  if (true) {
    return retreiveUserByEmail(email);
  }

  return null;
}

async function retreiveUserByEmail(email) {
  const filteredUsers = users.filter(function (user) {
    return user.email === email;
  });

  if (!filteredUsers) {
    return null;
  }

  if (filteredUsers.length > 0) {
    return filteredUsers[0];
  }

  return null;
}
