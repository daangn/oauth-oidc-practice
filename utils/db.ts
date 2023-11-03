type User = {
  id: string,
  name: string,
  github?: string,
};
export default User;

type AccountProvider = (
  | 'github'
  | 'oidc'
);

export type Account = {
  id: string,
  provider: AccountProvider,
  subject: string,
  user_id: string,
};

export type Session = {
  id: string,
  user_id: string,
  account_id: string,
};

export const users: User[] = [
];

export const accounts: Account[] = [
];

export const sessions: Session[] = [
];

export function createUser(input: {
  name: string,
}): User {
  const user: User = {
    id: crypto.randomUUID(),
    name: input.name,
  };
  users.push(user);
  return user;
}

export function updateUser(input: User): void {
  const user = users.find(user => user.id === input.id);
  if (user) {
    user.name = input.name;
  }
}

export function createAccount(input: {
  provider: AccountProvider,
  subject: string,
  user: User,
}): Account {
  const account: Account = {
    id: crypto.randomUUID(),
    provider: input.provider,
    subject: input.subject,
    user_id: input.user.id,
  };
  accounts.push(account);
  return account;
}

export function createSession(input: {
  account: Account,
  user: User,
}): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    account_id: input.account.id,
    user_id: input.user.id,
  };
  sessions.push(session);
  return session;
}

export function findSessionUser(input: {
  sessionId: string,
}): {
  session: Session,
  user: User,
} | null {
  const session = sessions.find(session => input.sessionId === session.id);
  if (!session) return null;

  const user = users.find(user => user.id === session.user_id);
  if (!user) return null;

  return { session, user };
}

export function findAccountUser(input: {
  provider: AccountProvider,
  subject: string,
}): {
  account: Account,
  user: User,
} | null {
  const account = accounts.find(account => account.provider === input.provider && account.subject === input.subject);
  if (!account) return null;

  const user = users.find(user => user.id === account.user_id);
  if (!user) return null;

  return { account, user };
}

export function signin(input: {
  provider: AccountProvider,
  subject: string,
  allowSignup: boolean,
  syncProperties: boolean,
  user: Omit<User, 'id'>,
}): {
  account: Account,
  session: Session,
  user: User,
} | null {
  const exist = findAccountUser(input);
  if (!exist && !input.allowSignup) {
    return null;
  }

  const user = exist?.user || createUser(input.user as any);

  // Optional. OAuth 2.0, SAML 등 표준은 인증 플로우 중 교환되는 어설션 attributes를 통해 Identity 정보를 동기화 할 수 있음.
  if (exist?.user && input.syncProperties) {
    updateUser({
      ...exist.user,
      ...input.user,
    });
  }

  const account = exist?.account || createAccount({
    user,
    provider: input.provider,
    subject: input.subject,
  });

  const session = createSession({
    user,
    account,
  });

  return {
    user,
    account,
    session,
  };
}
