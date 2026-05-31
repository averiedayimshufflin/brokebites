const BASE = 'https://api.spoonacular.com'
const KEY = process.env.SPOONACULAR_API_KEY  // server-only, no NEXT_PUBLIC_

export async function getRecipesByTag(tags: string, number = 1) {
  const res = await fetch(
    `${BASE}/recipes/complexSearch?apiKey=${KEY}&tags=${tags}&number=${number}&addRecipeInformation=true`
  )
  const data = await res.json()
  return data.results
}