# @ube-tsp/ky-client

Type-safe HTTP client generator using Ky that transforms operation maps into nested client methods.

## Usage

```typescript
import ky from "ky";
import { createClient } from "@ube-tsp/ky-client";
import { operationMap, type OperationMap } from "./generated/operation-map.js";

const kyInstance = ky.create({ prefixUrl: "https://api.example.com" });
const client = createClient<OperationMap>(kyInstance, operationMap);

// Use nested methods
await client.PetStore.getPet({ params: { path: { petId: 123 } } });
```

```bash
npm install @ube-tsp/ky-client ky
```

## TODO

- [ ] Derive request `Content-Type` from the operation map (emitted from TypeSpec) instead of inferring it from the JS body type at runtime

## License

MIT
