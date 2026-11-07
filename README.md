# SkillRetain

SkillRetain is a React app built with Vite.

## Local development

```sh
npm ci
npm run dev
```

Create a production build with `npm run build`.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the app when
changes are pushed to `main`. In the repository's **Settings → Pages**, set the
build and deployment source to **GitHub Actions**. The workflow configures Vite's
base path for the repository URL.

The deployed app still depends on the configured AWS Cognito user pool and API
Gateway endpoint. Those AWS services must allow the Pages origin.

Gemini requests are disabled in the frontend until they can be routed through a
protected backend. Do not put a Gemini API key in frontend code, a `VITE_*`
variable, or a GitHub Actions secret used to build this static site; values bundled
into browser code are visible to visitors.
