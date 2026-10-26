/**
 * A comment on a post or a page — the site's `comments/v1/comments`, as the visitor. The site
 * checks the record, the spam protection and its rules, and answers 201 with the comment as its
 * page presents it, or WordPress's error (400 with a message per field, 409, 429, 401).
 */
export default defineEventHandler(async (event) =>
  passThrough(event, await siteFetch<unknown>(event, '/wp-json/comments/v1/comments', {
    method: 'POST',
    body: formFields(await readBody(event)),
  })),
)
