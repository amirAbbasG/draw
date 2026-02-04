const path = require("path");
const { context } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const { parseEnvVariables } = require("../excalidraw/env.cjs");

const ENV_VARS = {
    ...parseEnvVariables(`${__dirname}/../.env.development`),
    DEV: true,
};

// Fast incremental dev build configuration
const getDevConfig = () => ({
    outdir: "dist/dev",
    bundle: true,
    splitting: true,
    format: "esm",
    packages: "external",
    plugins: [sassPlugin()],
    target: "es2020",
    assetNames: "[dir]/[name]",
    chunkNames: "[dir]/[name]-[hash]",
    entryPoints: ["index.tsx", "**/*.chunk.ts"],
    entryNames: "[name]",
    sourcemap: true,
    alias: {
        "@excalidraw/utils": path.resolve(__dirname, "../utils/src"),
    },
    external: ["@excalidraw/common", "@excalidraw/element", "@excalidraw/math"],
    loader: {
        ".woff2": "file",
    },
    define: {
        "import.meta.env": JSON.stringify(ENV_VARS),
    },
    logLevel: "info",
    metafile: true,
});

const startDevServer = async () => {
    console.log("🚀 Starting Excalidraw package dev mode...\n");

    try {
        // Create build context for watch mode with incremental builds
        const ctx = await context(getDevConfig());

        // Enable watch mode
        await ctx.watch();

        console.log("✅ Watching for changes...");
        console.log("📦 Initial build complete!");
        console.log("🔄 Changes will rebuild incrementally (fast!)\n");

        // Handle cleanup on exit
        process.on("SIGINT", async () => {
            console.log("\n🛑 Stopping dev server...");
            await ctx.dispose();
            process.exit(0);
        });

        process.on("SIGTERM", async () => {
            await ctx.dispose();
            process.exit(0);
        });
    } catch (error) {
        console.error("❌ Build failed:", error);
        process.exit(1);
    }
};

startDevServer();