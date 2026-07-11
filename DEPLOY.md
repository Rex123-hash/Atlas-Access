# Deploy — Cloud Run (backend) + Firebase Hosting (frontend)

AtlasAccess is a single Next.js app: the API routes are the backend and Next
renders the frontend. We deploy the whole container to **Cloud Run**, and put
**Firebase Hosting** in front as the public URL, rewriting every request to the
Cloud Run service. So the frontend is served on Firebase and the backend runs on
Cloud Run.

## Prerequisites (one time)

```bash
# Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  aiplatform.googleapis.com places.googleapis.com
# (billing must be enabled on the project)

# Firebase — same GCP project
npm i -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID     # this project id also goes in .firebaserc
```

## 1. Backend → Cloud Run

Cloud Build reads the `Dockerfile` (Next.js standalone, listens on `$PORT`).

```bash
gcloud run deploy atlas-access \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars USE_GEMINI=true,USE_VERTEX=true,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1
```

- `USE_VERTEX=true` uses the Cloud Run service account (Application Default
  Credentials) for Gemini — no API key in the repo. Grant the service account the
  **Vertex AI User** role.
- To use Google Places live venue data, also pass `GOOGLE_MAPS_API_KEY=...`
  (server-side only). Without it, the app uses built-in venue data.
- The service id **must** be `atlas-access` in **us-central1** to match
  `firebase.json`. Change both together if you use a different name/region.

## 2. Frontend → Firebase Hosting

`firebase.json` rewrites all traffic to the Cloud Run service above.

```bash
firebase deploy --only hosting
```

Your app is now live at `https://YOUR_PROJECT_ID.web.app` (frontend on Firebase,
backend on Cloud Run).

## Redeploys

```bash
gcloud run deploy atlas-access --source . --region us-central1   # backend
firebase deploy --only hosting                                   # frontend (rarely needed)
```

## Alternative: Firebase App Hosting (one step)

Firebase App Hosting deploys a Next.js app (SSR) directly onto Cloud Run and
manages the Hosting integration for you:

```bash
firebase experiments:enable webframeworks   # if prompted
firebase init apphosting
firebase deploy
```

Use this if you prefer a single managed pipeline instead of the explicit
two-step deploy above.
