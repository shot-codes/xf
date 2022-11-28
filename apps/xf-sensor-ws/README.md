# xf-sensor-web

## Install & Build

Create `.env` with the following contents (ex. `ws://localhost:4999`):

```env
VITE_WEBSOCKET_HOST=<websocket-host-ip>
```

Install dependencies and build the app with:

```bash
pnpm i && pnpm run build
```

The app will be located in `dist/`. It must be served over https to have access to the device motion api.
