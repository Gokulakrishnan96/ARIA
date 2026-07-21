# Aria — Internal documentation

Internal architecture docs for Aria (Mintlify-compatible source + black-theme viewer).

| Surface | Path |
| --- | --- |
| **Live viewer** | [`/docs`](http://localhost:3000/docs) in the running app |
| **Mintlify sources** | This folder (`docs/*.mdx`, `docs/mint.json`) |

## Publish with Mintlify (optional)

```bash
npx mintlify dev
```

Run from the `docs/` directory after installing the Mintlify CLI. The in-app viewer at `/docs` is the review surface for this pack — no Mintlify account required.

## Review gate

Confirm this documentation before implementing credits, APIs, dual-write schemas, or tenant execution environments.
