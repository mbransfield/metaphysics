import factories from "../api"

export default (opts) => {
  const { algoliaLoaderWithoutAuthenticationFactory } = factories(opts)
  const algoliaLoader = algoliaLoaderWithoutAuthenticationFactory

  return {
    algoliaQueryLoader: algoliaLoader(
      (index) => `/1/indexes/${index}/query`,
      {},
      { method: "POST" }
    ),
  }
}
