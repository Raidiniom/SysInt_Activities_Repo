import { gql } from '@apollo/client';

export const POSTS_SUBSCRIPTION = gql`
  subscription {
    postCreated {
      id
      title
      content
    }
  }
`;

export const POST_CREATE = gql`
  mutation Mutation($title: String!, $content: String!) {
    createPost(title: $title, content: $content) {
      id
      title
      content
  }
}
`;

export const POST_FETCH = gql`
  query Query {
    posts {
    id
    title
    content
  }
}
`;

