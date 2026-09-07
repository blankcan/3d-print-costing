# LXC deployment

This deployment keeps the application local-first: Caddy is the only LAN-facing process, while Node listens on `127.0.0.1:3001`. SQLite and job images live in `/var/lib/3d-print-costing`, outside the checked-out application release. The provided configuration assumes Caddy runs in the same LXC.

## One-time LXC setup

Use a Debian or Ubuntu LXC with Node.js, npm, Caddy, and a local DNS entry for `3dcosting.lab.local` pointing at the container.

Create the service account and application directories:

```bash
sudo useradd --system --user-group --home /opt/3d-print-costing --shell /usr/sbin/nologin 3dprintcosting
sudo install -d -o 3dprintcosting -g 3dprintcosting /opt/3d-print-costing
sudo install -d -m 0750 /etc/3d-print-costing
```

Copy the repository to `/opt/3d-print-costing`, then install and build as the service account:

```bash
sudo -u 3dprintcosting npm ci
sudo -u 3dprintcosting npm run build
```

Install the service and its environment file:

```bash
sudo install -m 0644 deploy/3d-print-costing.service /etc/systemd/system/3d-print-costing.service
sudo install -m 0640 -o root -g 3dprintcosting deploy/3d-print-costing.env.example /etc/3d-print-costing/3d-print-costing.env
sudo systemctl daemon-reload
sudo systemctl enable --now 3d-print-costing
```

Install `deploy/Caddyfile` as the relevant Caddy site configuration, validate it, then reload Caddy:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl reload caddy
```

The provided Caddy configuration uses `tls internal`. Install and trust Caddy's local root certificate on each LAN client before opening `https://3dcosting.lab.local`.

## Verification and operations

Check the private service and LAN-facing proxy:

```bash
curl http://127.0.0.1:3001/api/health
curl --resolve 3dcosting.lab.local:443:127.0.0.1 https://3dcosting.lab.local/api/health
sudo systemctl status 3d-print-costing
sudo journalctl -u 3d-print-costing -f
```

Back up `/var/lib/3d-print-costing/` as a single unit while the service is stopped. It contains both `app.db` and the `job-images/` directory.

## Release update

Back up the persistent data, replace the code under `/opt/3d-print-costing`, then run:

```bash
sudo -u 3dprintcosting npm ci
sudo -u 3dprintcosting npm run build
sudo systemctl restart 3d-print-costing
```

Never replace or delete `/var/lib/3d-print-costing/` during an application release.

## Caddy on another host

If Caddy runs outside this LXC, set `HOST` in `/etc/3d-print-costing/3d-print-costing.env` to the LXC's private address and change `reverse_proxy` to that address. Restrict port `3001` at the Proxmox or LXC firewall so only the Caddy host can reach it; do not expose the Node listener to the wider LAN.
