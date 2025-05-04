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

touch .env .dockerignore

cat > .dockerignore <<'EOF'
node_modules/
build/
.env
EOF

mkdir -p src build

mkdir -p src/kafka src/controller src/route

cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "es2020",
    "module": "NodeNext",
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

npx npm pkg set scripts.dev="ts-node-dev --respawn src/index.ts"
npx npm pkg set scripts.build="tsc"
npx npm pkg set scripts.start="node build/index.js"

cat > src/index.ts <<'EOF'
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Welcome to the service!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
EOF

echo "✅ $SERVICE_NAME setup complete."
echo "👉 Run 'npm run dev' to start developing."
