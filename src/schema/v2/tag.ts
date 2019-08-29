import cached from "./fields/cached"
import Image from "./image"
import { NodeInterface, SlugAndInternalIDFields } from "./object_identification"
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLFieldConfig,
} from "graphql"
import { queriedForFieldsOtherThanBlacklisted } from "lib/helpers"
import { ResolverContext } from "types/graphql"

export const TagType = new GraphQLObjectType<any, ResolverContext>({
  name: "Tag",
  interfaces: [NodeInterface],
  fields: () => {
    return {
      ...SlugAndInternalIDFields,
      cached,
      description: {
        type: GraphQLString,
      },
      name: {
        type: GraphQLString,
      },
      href: {
        type: GraphQLString,
        resolve: ({ id }) => `tag/${id}`,
      },
      image: Image,
      count: {
        type: GraphQLInt,
      },
    }
  },
})

const Tag: GraphQLFieldConfig<void, ResolverContext> = {
  type: TagType,
  args: {
    id: {
      description: "The slug or ID of the Tag",
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  resolve: (_root, { id }, { tagLoader }, info) => {
    // If you are just making an artworks call ( e.g. if paginating )
    // do not make a Gravity call for the gene data.
    const blacklistedFields = ["filteredArtworks", "id", "internalID"]
    if (queriedForFieldsOtherThanBlacklisted(info, blacklistedFields)) {
      return tagLoader(id).then(tag => {
        return Object.assign(tag, { _type: "Tag" }, {})
      })
    }

    // The family and browsable are here so that the type system's `isTypeOf`
    // resolves correctly when we're skipping gravity data
    return { id, _type: "Tag" }
  },
}

export default Tag
