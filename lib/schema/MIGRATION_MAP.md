# Migration Map — v1 → v2

Canonical reference for what changes in the field rename pass. The v1 collections (`shows`, `collections`, `recommendations`, `pages`, `settings`) are left untouched; new data lives in `shows_v2`, `collections_v2`, etc.

**Doc IDs are preserved** — `p1`, `card_1`, `rec1` continue to resolve. Only the one odd auto-ID `recmo5ichc2` is normalized (see Recommendations below).

## shows → shows_v2

| v1 field                         | v2 field                    | transform                                                                     |
| -------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `title`                          | `title`                     | unchanged                                                                     |
| `category`                       | `category`                  | unchanged (`kids` / `youth` / `adults`)                                       |
| `type`                           | — (dropped)                 | always `'single'` in v1, useless                                              |
| `importance`                     | `priority`                  | `recommended` → `featured`; anything else → `normal` (fixes p2 "single" bug)  |
| `mainImg`                        | `mainImg`                   | unchanged                                                                     |
| `mainImg1` + `textUnderImg1`     | `presentationFormats[0]`    | merged into `{ image, caption }` — only if `mainImg1` non-empty               |
| `mainImg2` + `textUnderImg2`     | `presentationFormats[1]`    | same                                                                          |
| `arrayGallery` (array of `{img}`) | `gallery` (string[])       | flattened to plain URL strings                                                |
| `showData.title`                 | — (dropped)                 | duplicate of top-level `title`                                                |
| `showData.description`           | `description`               | moved to top level                                                            |
| `showData.audience`              | `audience`                  | moved to top level                                                            |
| `showData.creatorName`           | `creatorName`               | moved to top level                                                            |
| `showData.creatorIntro`          | `creatorIntro`              | moved to top level                                                            |
| `showData.creatorCredentials`    | `creatorCredentials`        | moved to top level                                                            |
| `showData.socialProof`           | `socialProof`               | moved to top level                                                            |
| `showData.phone`                 | `phone`                     | moved to top level                                                            |
| `vidue.Trailer` (iframe HTML[])  | `video.trailers` (ytId[])   | extract YouTube ID from `/embed/<ID>`                                         |
| `vidue.clips`                    | `video.clips`               | each `{ youtubeId, caption }` kept as-is                                      |
| `vidue.customers`                | `video.customerClips`       | renamed for clarity                                                           |
| `linkRec`                        | `recommendationIds`         | unchanged structure                                                           |

## collections → collections_v2

| v1 field                         | v2 field                    | transform                                                                     |
| -------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `id`, `title`, `description`     | same                        | unchanged                                                                     |
| `mainImg`                        | `mainImg`                   | unchanged                                                                     |
| `type`                           | `type`                      | unchanged (`single` / `collection`)                                           |
| `importance`                     | `priority`                  | `recommended` → `featured`, else `normal`                                     |
| `linkedShowId` (when type=single)| `linkedShowId`              | unchanged (already a clean show ID like `p1`)                                 |
| `contains`                       | `showIds`                   | same array, cleaner name                                                      |
| `collectionGallery`              | `gallery`                   | flattened `{img}` → URL string                                                |
| `collectionVideo` (iframe HTML[])| `videos` (ytId[])           | extracted YouTube IDs                                                         |
| `extraContent`                   | `extendedHtml`              | renamed                                                                       |
| `linkRec`                        | `recommendationIds`         | unchanged structure                                                           |

## recommendations → recommendations_v2

| v1 field                         | v2 field                        | transform                                                                 |
| -------------------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| `recommenderName` / `Role`       | same                            | unchanged                                                                 |
| `contactInfo`, `date`            | same                            | unchanged                                                                 |
| `content`                        | `content`                       | unchanged                                                                 |
| `type` (always `'recommendation'`) | — (dropped)                   | the whole collection is recommendations                                   |
| `linkedShowId` (path string)     | `linkedTarget: { kind, id }`    | parses `/show/p1` → `{ kind: 'show', id: 'p1' }`; malformed → null        |
| `relatedShow` (display string)   | — (dropped)                     | derivable from `linkedTarget.id` → title lookup                           |

**Doc IDs**: all `rec1`..`rec20` kept. The odd `recmo5ichc2` is **rewritten** under its own path (not renamed to `rec21`) — no destructive change. Its internal `id` field is normalized to match the doc path.

## pages/about → pages_v2/about

| v1 field                         | v2 field                    |
| -------------------------------- | --------------------------- |
| `title`, `mainImage`, `mainDescription` | unchanged             |
| `testimonials[].author`          | `.author`                   |
| `testimonials[].text`            | `.text`                     |
| `testimonials[].fromPresention`  | `.fromShowTitle` (typo fix) |
| `testimonials[].linkP`           | `.showId`                   |
| `testimonials[].linkRecId`       | `.recommendationId`         |

## pages/puppets → pages_v2/puppets

| v1 field                         | v2 field                    | notes                           |
| -------------------------------- | --------------------------- | ------------------------------- |
| `title`, `paragraph`, `youtubeVideoId`, `summaryQuote` | unchanged | — |
| `subtitle` AND `subTitle`        | `subtitle` AND `infoListTitle` | v1 had both; kept distinct roles |
| `infoTitle`                      | `infoSectionTitle`          | clearer                         |
| `infoList[].title` / `.text`     | unchanged                   | —                               |

## settings/homeGallery → settings_v2/homeGallery

Unchanged (`images: string[]`).
