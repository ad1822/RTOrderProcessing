#!/bin/bash

# -------------------------------
# Microservice Setup Script
# Node.js + TypeScript + Express + KafkaJS
# -------------------------------

set -e

SERVICE_NAME=$(basename "$PWD")

echo "📦 Initializing $SERVICE_NAME..."

npm init -y

npm install express kafkajs

npm install --save-dev @types/kafkajs

npm install --save-dev typescript ts-node-dev @types/node @types/express

mkdir -p src build

cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "allowJs": true,
    "outDir": "build",
    "rootDir": "src",
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
EOF

# Step 6: Add scripts to package.json
npx npm pkg set scripts.dev="ts-node-dev --respawn src/index.ts"
npx npm pkg set scripts.build="tsc"
npx npm pkg set scripts.start="node build/index.js"

# Step 7: Create entry file
cat > src/index.ts <<'EOF'
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Welcome to the service!');
});

app.listen(PORT, () => {
  console.log(\`🚀 $SERVICE_NAME is running on port \${PORT}\`);
});
EOF

echo "✅ $SERVICE_NAME setup complete."
echo "👉 Run 'npm run dev' to start developing."


