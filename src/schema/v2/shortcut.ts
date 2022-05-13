import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFieldConfig,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLUnionType,
} from "graphql"
import { ResolverContext } from "types/graphql"
import { IDFields } from "./object_identification"

import { mutationWithClientMutationId } from "graphql-relay"
import {
  GravityMutationErrorType,
  formatGravityError,
} from "lib/gravityErrorHandler"
import { InternalIDFields } from "./object_identification"

export interface Shortcut {
  id: string
  long: string
  short: string
}

export const shortcutType = new GraphQLObjectType<Shortcut, ResolverContext>({
  name: "Shortcut",
  fields: {
    ...IDFields,
    long: { type: new GraphQLNonNull(GraphQLString) },
    short: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const shortcut: GraphQLFieldConfig<void, ResolverContext> = {
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  type: new GraphQLNonNull(shortcutType),
  resolve: (_source, { id }, { shortcutLoader }) => {
    return shortcutLoader(id)
  },
}

const CreateShortcutInputType = new GraphQLInputObjectType({
  name: "CreateShortcutInput",
  fields: {
    short: {
      type: GraphQLString,
      description: "Short Artsy url",
    },
    long: {
      type: GraphQLString,
      description: "Url to redirect to",
    },
  },
})

export const createShortcutMutation = mutationWithClientMutationId<
  any,
  any,
  ResolverContext
>({
  name: "CreateShortcutMutation",
  description: "Create an Artsy shortcut",
  inputFields: CreateShortcutInputType.getFields(),
  outputFields: {
    shortcut: {
      type: shortcutType,
      resolve: (result) => result,
    },
  },
  mutateAndGetPayload: ({ short, long }, { createShortcutLoader }) => {
    if (!createShortcutLoader) {
      return new Error("You need to be signed in to perform this action")
    }
    const gravityOptions = {
      short,
      long,
    }
    return createShortcutLoader(gravityOptions)
      .then((result) => result)
      .catch((error) => {
        throw new Error(error)
      })
  },
})
