// File: src/api/routes/index.ts

import registerV1_0_Routes from "./v1.0";

// The Route.ts file is looking for a named export called "versions".
// This object provides it. The keys ('v1.0', 'v1.1') will become the URL prefixes.
export const versions = {
  "v1.0": registerV1_0_Routes,
};
