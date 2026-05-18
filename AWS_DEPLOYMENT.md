# AWS deployment

This repository is a multi-container app. The lowest-friction AWS target is one EC2 instance running Docker Compose.

## Best free-tier fit

- If your AWS account was created on or after July 15, 2025, use the AWS Free plan credits with an x86 `t3.small` instance. This repo is too heavy for the older 1 GB micro instances.
- If your AWS account was created before July 15, 2025, the classic `t2.micro`/`t3.micro` free tier is technically eligible, but this stack is not a realistic always-on fit for that size.

## What was added

- `docker-compose.aws.yml`: production-oriented single-host stack
- `.env.aws.example`: deployment variables
- `deploy/aws/edge-nginx.conf`: one public entry point for frontend, API, uploads, and websocket traffic
- `sir-maroc-front/Dockerfile.prod`: static frontend build for production

## EC2 setup

1. Launch an Ubuntu x86_64 EC2 instance.
2. Open security group ports `22` and `80`.
3. Install Docker Engine and the Docker Compose plugin.
4. Clone this repository onto the instance.

## Configure environment

1. Copy `.env.aws.example` to `.env.aws`.
2. Set `PUBLIC_APP_URL` to your EC2 public IP or domain, for example `http://54.12.34.56`.
3. Replace `MSSQL_SA_PASSWORD`, `JWT_SECRET_KEY`, and `GATEWAY_SHARED_SECRET` with strong values.
4. Fill `SERPAPI_API_KEY`, `SENDGRID_*`, and `GOOGLE_AUTH_*` only if you use those features.

## Deploy

```bash
docker compose --env-file .env.aws -f docker-compose.aws.yml up -d --build
```

## Check

```bash
docker compose --env-file .env.aws -f docker-compose.aws.yml ps
curl http://YOUR_EC2_PUBLIC_IP/health
```

## Notes

- The public entry point is the `edge` container on port `80`.
- The frontend is built with `PUBLIC_APP_URL` so browser requests no longer depend on `localhost`.
- Tourism uploads are served through `/uploads/...`.
- Auth profile images are served through `/uploads/profiles/...`.
- The Symfony container now runs its bootstrapping entrypoint so vendor restoration and migrations happen during startup.
