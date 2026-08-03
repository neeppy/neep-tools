# nexi toolkit

A self-hostable collection of everyday developer tools (JSON formatting, text diffing, and more to
come), built with SvelteKit.

## Running with Docker

Pull the published image and run it:

```sh
docker run -d --name nexi-toolkit -p 3000:3000 -e ORIGIN=http://localhost:3000 ghcr.io/neeppy/neep-tools:latest
```

Or with Docker Compose:

```sh
docker compose up -d
```

The app will be available at `http://localhost:3000`.

### Configuration

| Variable | Default   | Description                                                                                     |
| -------- | --------- | ----------------------------------------------------------------------------------------------- |
| `PORT`   | `3000`    | Port the server listens on.                                                                     |
| `HOST`   | `0.0.0.0` | Address the server binds to.                                                                    |
| `ORIGIN` | —         | Public URL of the app (e.g. `https://tools.example.com`). Set this when running behind a proxy. |

## Developing

Install dependencies and start a dev server:

```sh
pnpm install
pnpm dev --open
```

## Building

```sh
pnpm build
```

The production server is a standalone Node app; run it with `node build` (or `pnpm preview` to
build and preview in one step).

## Building the Docker image locally

```sh
docker build -t nexi-toolkit .
docker run -d -p 3000:3000 -e ORIGIN=http://localhost:3000 nexi-toolkit
```

## Publishing

Pushing to `main` builds and publishes `ghcr.io/neeppy/neep-tools:latest`. Pushing a `vX.Y.Z` tag
also publishes matching semver tags. See
[`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml).
