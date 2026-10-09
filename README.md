# next-useoffline-export-repro

Minimal reproduction: with `output: "export"` and `experimental.useOffline: true`, the retry of a client navigation
that started while offline requests `/<page>.txt.txt` (404) once the connection is back, and the router falls back to a
full document load.

Tested with `next@16.5.0-canary.5` (Turbopack build) and `next@16.3.8`.

## Steps

1. `npm install`
2. `npm run build`
3. `npm run serve` (serves `out/` on http://localhost:3000 and logs every request)
4. Open http://localhost:3000 with DevTools → Network open.
5. Switch the network to **Offline**.
6. Click **Other**: the navigation waits for the connection.
7. Switch the network back to **Online**.

## Result

```
GET /other.txt?_rsc=…      (offline attempt, fails)
HEAD /                     (connectivity polling)
--- back online ---
HEAD /                     200
GET /other.txt.txt?_rsc=…  404   ← `.txt` appended twice
GET /other                 200   ← document request: full reload, client state lost
```

Expected: `GET /other.txt?_rsc=…` → 200 and the navigation completes in the same document.

In `dist/esm/client/components/router-reducer/fetch-server-response.js`, the `useOffline` retry calls
`fetchServerResponse(url, options)` with the URL that already has `.txt` appended for static export. Calling it with
`originalUrl` instead fixes it locally (same steps: `GET /other.txt` → 200, same document).
