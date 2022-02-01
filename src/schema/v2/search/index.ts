import {
  GraphQLList,
  GraphQLEnumType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLFieldConfigArgumentMap,
} from "graphql"
import { pageable } from "relay-cursor-paging"

import { connectionWithCursorInfo } from "schema/v2/fields/pagination"
import { Searchable } from "schema/v2/searchable"
import { SearchEntity } from "./SearchEntity"
import { ResolverContext } from "types/graphql"
import {
  SearchAggregationResultsType,
  SearchAggregation,
} from "schema/v2/search/SearchAggregation"
import { map } from "lodash"
import { SearchResolver } from "./SearchResolver"
import { AlgoliaSearchResolver } from "./AlgoliaSearchResolver"
import config from "config"

export const SearchMode = new GraphQLEnumType({
  name: "SearchMode",
  values: {
    AUTOSUGGEST: {
      value: "AUTOSUGGEST",
    },
    SITE: {
      value: "SITE",
    },
  },
})

export const searchArgs: GraphQLFieldConfigArgumentMap = pageable({
  query: {
    type: new GraphQLNonNull(GraphQLString),
    description: "Search query to perform. Required.",
  },
  entities: {
    type: new GraphQLList(SearchEntity),
    description: "Entities to include in search. Default: [ARTIST, ARTWORK].",
  },
  mode: {
    type: SearchMode,
    description: "Mode of search to execute. Default: SITE.",
  },
  aggregations: {
    type: new GraphQLList(SearchAggregation),
  },
  page: {
    type: GraphQLInt,
    description: "If present, will be used for pagination instead of cursors.",
  },
})

export const SearchAggregations: GraphQLFieldConfig<any, ResolverContext> = {
  description: "Returns aggregation counts for the given filter query.",
  type: new GraphQLList(SearchAggregationResultsType),
  resolve: ({ aggregations }) => {
    return map(aggregations, (counts, slice) => ({
      slice,
      counts,
    }))
  },
}

const SearchConnection = connectionWithCursorInfo({
  nodeType: Searchable,
  connectionFields: {
    aggregations: SearchAggregations,
  },
})

export const Search: GraphQLFieldConfig<void, ResolverContext> = {
  type: SearchConnection.connectionType,
  description: "Global search",
  args: searchArgs,
  resolve: (_source, args, context, info) => {
    const { ENABLE_ALGOLIA_SEARCH_RESOLUTION } = config
    let resolver

    if (ENABLE_ALGOLIA_SEARCH_RESOLUTION) {
      resolver = new AlgoliaSearchResolver(args, context)
    } else {
      resolver = new SearchResolver(args, context, info)
    }

    return resolver.resolve()
  },
}
