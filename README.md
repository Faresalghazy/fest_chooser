# Metal Summer 2027

A one-page site that compares the big European metal festivals of 2027 and helps you pick one.

- **Ranking**: every festival scored on what you care about (your bands, sentiment, ticket ease, scale, metal focus, lineup uniqueness, price, camping). Move the sliders to change the weights.
- **Lineups**: each festival's 2027 bill so far, which bands are exclusive, and which festivals share bands.
- **All bands**: every announced band. Press **+ Add** to give a band a Headbang score (50 by default), then type any number you like.
- **Calendar**: dates and clashes.
- **My bands**: your bands with their Headbang scores, plus each festival's band count and Headbang total.

Your bands and slider settings are stored in your own browser, so every friend gets their own.
To use the same setup on another browser or your phone, use **Sync with your other browsers** at the top of the My bands tab.

## Live lineup updates

When someone opens the page (at most every 3 hours, or with **Check now**), their browser re-reads the festival listings on
[festivalhopper.de](https://www.festivalhopper.de) and [festivalinfo.nl](https://www.festivalinfo.nl) through the free
[Jina Reader](https://jina.ai/reader/) (`r.jina.ai`), which is what makes cross-site reading possible from a static page.
Newly announced bands are merged in and marked **new**. Nothing else needs to run: no server, no API key.

Which sources each festival uses is set in `live_sources` in `festivals.json`. Festivals without a parseable listing
(Resurrection Fest, Bloodstock, Rock Fest Barcelona, Masters of Rock, Leyendas del Rock, Motocultor) get their `lineup`
updated by hand when they announce.

Ticket status, prices, sentiment and ratings are hand-checked data in `festivals.json` (last update: see `meta.json`).
Edit those files and push to update everyone.

## Sync between browsers

Without any setup, **Copy transfer code** in the My bands tab copies your bands and sliders to another browser once.

For live sync with a short code (like `ABCD-EFGH`), deploy the free Cloudflare Worker in `worker/` once:

1. In the Cloudflare dashboard, open **Storage & Databases -> KV** and create a namespace called `metal-summer-sync`.
2. Open **Workers & Pages -> Create -> Create Worker**, name it `metal-summer-sync`, deploy, then **Edit code**:
   replace everything with `worker/sync-worker.js` and deploy again.
3. In the worker's **Settings -> Bindings**, add a **KV namespace** binding with variable name `SYNC` pointing to the
   namespace from step 1.
4. Put the worker's address in `config.json`, for example `{ "syncUrl": "https://metal-summer-sync.<you>.workers.dev" }`, and push.

The free plan allows 100,000 reads and 1,000 writes a day, far more than a group of friends needs. Codes are random,
8 characters long, and only store band names, scores and slider settings.

## Publish on GitHub Pages

1. Create a new repository on GitHub and upload all files in this folder.
2. In the repository, open **Settings -> Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
3. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`. Share that link.

To preview locally: run `python -m http.server` in this folder and open http://localhost:8000 (opening `index.html`
directly from disk won't load the data).
