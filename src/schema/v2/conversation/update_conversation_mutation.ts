import { GraphQLBoolean } from "graphql"
import { GraphQLString, GraphQLNonNull } from "graphql"
import { mutationWithClientMutationId } from "graphql-relay"
import Conversation from "schema/v2/conversation"
import { ResolverContext } from "types/graphql"

interface UpdateMessageMutationInputProps {
  conversationId: string
  fromLastViewedMessageId: string
}

export default mutationWithClientMutationId<
  UpdateMessageMutationInputProps,
  any,
  ResolverContext
>({
  name: "UpdateConversationMutation",
  description: "Update a conversation.",
  inputFields: {
    conversationId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The id of the conversation to be updated.",
    },
    dismissed: {
      type: GraphQLBoolean,
      description: "Mark the conversation as dismissed",
    },
    fromLastViewedMessageId: {
      type: GraphQLString,
      description: "The message id to mark as read.",
    },
    sellerOutcome: {
      type: GraphQLString,
      description:
        "The seller outcome for the conversation. Options include `already_contacted`, `dont_trust`, `other`, `work_unavailable`.",
    },
    sellerOutcomeComment: {
      type: GraphQLString,
      description: "The seller outcome comment for the conversation.",
    },
  },
  outputFields: {
    conversation: {
      type: Conversation.type,
      resolve: (conversation) => conversation,
    },
  },
  mutateAndGetPayload: async (
    { conversationId, ...args },
    { conversationUpdateLoader }
  ) => {
    if (!conversationUpdateLoader) {
      return null
    }

    try {
      const updatedConversation = await conversationUpdateLoader(
        conversationId,
        args
      )
      return updatedConversation
    } catch (error) {
      throw new Error(error.body?.error)
    }
  },
})
