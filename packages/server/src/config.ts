import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_CLOUD = process.env.CLOUD === "true";
export const PORT = parseInt(process.env.PORT || "8000", 10);

export const WEBSITE_STATIC_DIR = path.join(
    path.dirname(__dirname),
    "node_modules/@lambda-visualizer/frontend/dist"
);

export const LAMBDA_BINARY = path.join(
    path.dirname(__dirname),
    "node_modules/@lambda-visualizer/lambda/bootstrap"
);
