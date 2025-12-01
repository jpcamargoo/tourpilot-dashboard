import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    guiaId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      guiaId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    guiaId?: string;
  }
}
