# HBLE Merch Studio — staging

This is a review-only staging branch. The live merch.html on master remains unchanged.

## Editing
Open merch-studio.html as a web page to preview product text and locally selected images. Export JSON to save product text. This is not a server-side CMS, and the preview does not write to GitHub.

## GitHub-secured publication
1. Sign into GitHub as an authorized collaborator.
2. Upload the approved files to this branch: images/hble-queen-of-spades.jpg and images/hble-the-dove.png. Use the approved official HBLE spade crown only; no generic crowns or crosses.
3. Commit product JSON and reviewed website changes to this branch.
4. Open a pull request from hble-merch-studio-staging into master. Review it and merge only after checking the preview and photos.
5. Netlify can deploy master once its existing build settings are confirmed.

## Security
Do not put a GitHub personal access token into client-side HTML, localStorage, or public JavaScript. Direct browser-to-GitHub publishing requires an authenticated backend/OAuth integration. This branch does not provide that feature yet.
