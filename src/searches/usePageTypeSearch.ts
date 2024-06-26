// @ts-strict-ignore
import { gql } from "@apollo/client";
import {
  SearchPageTypesDocument,
  SearchPageTypesQuery,
  SearchPageTypesQueryVariables,
} from "@dashboard/graphql";
import makeTopLevelSearch from "@dashboard/hooks/makeTopLevelSearch";

export const searchPageTypes = gql`
  query SearchPageTypes($after: String, $first: Int!, $query: String!) {
    search: pageTypes(after: $after, first: $first, filter: { search: $query }) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
`;

export default makeTopLevelSearch<SearchPageTypesQuery, SearchPageTypesQueryVariables>(
  SearchPageTypesDocument,
);
