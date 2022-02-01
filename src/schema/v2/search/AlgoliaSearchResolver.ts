import { connectionFromArraySlice } from "graphql-relay"
import { ResolverContext } from "types/graphql"

import { createPageCursors, pageToCursor } from "../fields/pagination"
import { convertConnectionArgsToGravityArgs } from "lib/helpers"

export class AlgoliaSearchResolver {
  private args: { [argName: string]: any }
  private context: ResolverContext

  constructor(args: { [argName: string]: any }, context: ResolverContext) {
    this.args = args
    this.context = context
  }

  async resolve() {
    const pageOptions = convertConnectionArgsToGravityArgs(this.args)
    let index: string
    let filters: string = ""

    if (!this.args.entities || this.args.entities.length > 1) {
      index = `Global_production`
      filters = this.args.entities
        .map((entity) => `type:${entity}`)
        .join(" OR ")
    } else {
      index = `${this.args.entities[0]}_production`
    }

    const result = await this.context.algoliaQueryLoader(index, {
      query: this.args.query,
      filters,
      hitsPerPage: pageOptions.size,
      page: pageOptions.page,
    })

    const results = result.hits.map((hit) => {
      return {
        ...hit,
        display: hit["name"],
        __typename: "SearchableItem",
      }
    })
    const connection = connectionFromArraySlice(results, this.args, {
      arrayLength: results.length,
      sliceStart: result.offset || 0,
    })

    const pageInfo = connection.pageInfo
    ;(pageInfo.hasNextPage = result.page < result.nbPages - 1),
      (pageInfo.hasPreviousPage = result.nbPages > 1 && result.page !== 1),
      (pageInfo.endCursor = pageToCursor(
        pageOptions.page + 1,
        pageOptions.size
      ))

    const pageCursors = createPageCursors(pageOptions, result.nbHits)

    return {
      aggregations: {},
      pageCursors,
      totalCount: result.nbHits,
      ...connection,
      pageInfo,
    }
  }
}
