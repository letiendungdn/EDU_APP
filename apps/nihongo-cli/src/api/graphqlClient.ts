import {ApolloClient, InMemoryCache, createHttpLink, gql} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {useAuthStore} from '../store/authStore';

const httpLink = createHttpLink({
  uri: __DEV__
    ? 'http://10.0.2.2:3001/graphql'
    : 'https://api.nihongo.app/graphql',
});

// Attach auth token to every GQL request
const authLink = setContext((_, {headers}) => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      ...headers,
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
  };
});

export const gqlClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {fetchPolicy: 'cache-and-network'},
  },
});

// ── Queries ──────────────────────────────────────────────────────────────────

export const GET_VOCAB_LIST = gql`
  query GetVocabList($level: String, $page: Int, $limit: Int) {
    vocabList(level: $level, page: $page, limit: $limit) {
      total
      items {
        id
        word
        reading
        meaning
        level
        srsInterval
        srsDue
      }
    }
  }
`;

export const GET_VOCAB_DETAIL = gql`
  query GetVocabDetail($id: Int!) {
    vocab(id: $id) {
      id
      word
      reading
      meaning
      level
      examples {
        sentence
        translation
      }
    }
  }
`;

export const GET_MY_PROGRESS = gql`
  query GetMyProgress {
    myProgress {
      totalCards
      masteredCards
      dueToday
      streakDays
    }
  }
`;

// ── Mutations ─────────────────────────────────────────────────────────────────

export const SUBMIT_SRS = gql`
  mutation SubmitSrs($vocabId: Int!, $quality: Int!) {
    submitSrs(vocabId: $vocabId, quality: $quality) {
      nextInterval
      nextDue
    }
  }
`;
