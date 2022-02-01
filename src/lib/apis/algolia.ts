import urljoin from "url-join"
import fetch from "./fetch"
import config from "config"
import { assign } from "lodash"

const { ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY } = config
const host = `https://${ALGOLIA_APP_ID}-dsn.algolia.net`

export default (path, accessToken, fetchOptions = {}) => {
  const headers = { Accept: "application/json" }
  // TODO: Generated secured API key with narrower access
  const apiKey = accessToken || ALGOLIA_SEARCH_API_KEY

  assign(headers, {
    "X-Algolia-Application-Id": ALGOLIA_APP_ID,
    "X-Algolia-API-Key": apiKey,
  })

  return fetch(urljoin(host, path), assign({}, fetchOptions, { headers }))
}
