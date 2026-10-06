# Question pack format

One JSON file per pack: `packages/content/packs/<lang>/<pack-id>.json`.

```jsonc
{
  "id": "general-da-001",
  "lang": "da",            // ISO 639-1
  "title": "Blandet 1",
  "ageMin": 12,
  "categories": [
    { "id": "geo", "name": "Geografi", "icon": "🌍" }
  ],
  "questions": [
    {
      "id": "geo-0001",
      "category": "geo",
      "difficulty": 2,                 // 1 (easy) – 3 (hard)
      "type": "choice",                // choice | text | number | order | judge
      "prompt": "Hvad er hovedstaden i Australien?",
      "choices": ["Sydney", "Melbourne", "Canberra", "Perth"],
      "answer": 2                      // index for choice
    },
    {
      "id": "geo-0002",
      "category": "geo",
      "difficulty": 1,
      "type": "text",
      "prompt": "Hvilket land har byen Bergen?",
      "answer": "Norge",
      "accept": ["norway", "noreg"]    // extra accepted spellings (case/accents ignored)
    },
    {
      "id": "geo-0003",
      "category": "geo",
      "difficulty": 3,
      "type": "number",
      "prompt": "Hvor mange meter er Mount Everest høj (ca.)?",
      "answer": 8849,
      "tolerance": 50                  // within ±tolerance counts as correct; otherwise closest wins
    }
  ]
}
```

Rules:
- `id`s are unique across all packs (they are used to avoid repeats).
- Optional fields: `source` (URL), `image` (path), `explanation` (shown on reveal).
- A validator in `packages/content` checks this schema (zod) in CI.
