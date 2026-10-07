# Durvankur portfolio

## Updating the card stacks

Drop photos into `assets/photos/`, then run:

```bash
npm run build
```

Every supported image in that folder becomes part of the hero photo stack. Supported formats are JPG, PNG, WebP, GIF, and AVIF.

For a project, add its image to `assets/projects/` and place a JSON file beside it with the same name. For example, `customer-churn.png` uses `customer-churn.json`:

```json
{
  "title": "Customer churn",
  "description": "Predicts churn from account activity and support signals.",
  "tags": ["Python", "XGBoost"],
  "link": "https://github.com/your-username/customer-churn"
}
```

Run `npm run build` after adding photos or projects. The command regenerates `assets/content.js`, which the site uses for both stacks. On Netlify, this runs automatically for every deploy.

While editing locally, run this once in a second terminal to rebuild the index every time you add, replace, or remove a supported photo or project image:

```bash
npm run watch
```

Refresh the browser after the watcher reports an update. The generated index is served with revalidation enabled on Netlify, so a refreshed published site always receives the latest deployed content.

## Visitor counter

The displayed counter is a Netlify serverless function backed by Netlify Blobs. Deploy through Netlify for it to increment globally for each page visit. It has a clear offline/local fallback and does not pretend a browser-only counter is shared between visitors.

## Deploy to Netlify

1. Push the repository to GitHub.
2. In Netlify, choose **Add new site** and import the repository.
3. Netlify reads `netlify.toml`, installs the dependency, runs the build, and serves the site plus counter function.

GitHub Pages can host the site, but cannot run the shared visitor-counter function.

## Social links

Edit assets/socials.js to paste your email and profile URLs. Empty url values are automatically hidden from the contact section.
