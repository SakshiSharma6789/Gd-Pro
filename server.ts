// import express from 'express';
// import cors from 'cors';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { createServer as createViteServer } from 'vite';
// import admin from 'firebase-admin';
// import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Initialize Firebase Admin lazily
// let db: admin.firestore.Firestore;

// async function initFirebase() {
//   try {
//     const configPath = path.join(__dirname, 'firebase-applet-config.json');
//     if (!fs.existsSync(configPath)) {
//       console.warn('firebase-applet-config.json not found. Database features may be limited.');
//       return;
//     }
//     const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
//     admin.initializeApp({
//       projectId: firebaseConfig.projectId,
//     });
//     db = admin.firestore(firebaseConfig.firestoreDatabaseId);
//     console.log('Firebase Admin initialized successfully');
//   } catch (error) {
//     console.error('Failed to initialize Firebase Admin:', error);
//   }
// }

// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = 3000;

// // --- API Routes ---

// // Get Topics
// app.get('/api/v1/topics', async (req, res) => {
//   try {
//     if (!db) await initFirebase();
//     if (!db) return res.status(503).json({ error: 'Database not initialized' });

//     const snapshot = await db.collection('topics').get();
//     const topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     res.json(topics);
//   } catch (error) {
//     console.error('Fetch Topics Error:', error);
//     res.status(500).json({ error: 'Failed to fetch topics' });
//   }
// });

// // --- Vite Middleware ---

// async function startServer() {
//   console.log('Starting server initialization...');

//   // Initialize Firebase in background
//   initFirebase().catch(err => console.error('Background Firebase Init Error:', err));

//   try {
//     if (process.env.NODE_ENV !== 'production') {
//       console.log('Setting up Vite middleware...');
//       const vite = await createViteServer({
//         server: {
//           middlewareMode: true,
//           hmr: {
//              port: 3001 // Use a different port for HMR internally if needed, but HMR is usually disabled
//           }
//         },
//         appType: 'spa',
//       });
//       app.use(vite.middlewares);
//       console.log('Vite middleware mounted');
//     } else {
//       console.log('Setting up static file serving for production...');
//       const distPath = path.join(__dirname, 'dist');
//       app.use(express.static(distPath));
//       app.get('*', (req, res) => {
//         res.sendFile(path.join(distPath, 'index.html'));
//       });
//     }

//     const server = app.listen(PORT, '0.0.0.0', () => {
//       console.log(`Server is LISTENING at http://0.0.0.0:${PORT}`);
//     });

//     server.on('error', (err) => {
//       console.error('Server listen error:', err);
//     });

//   } catch (err) {
//     console.error('CRITICAL: Failed to start server:', err);
//     process.exit(1);
//   }
// }

// startServer();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin lazily
let db: any;

async function initFirebase() {
  try {
    const configPath = path.join(__dirname, "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn(
        "firebase-applet-config.json not found. Database features may be limited.",
      );
      return;
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

    const app =
      admin.apps.length === 0
        ? admin.initializeApp({ projectId: firebaseConfig.projectId })
        : admin.apps[0];

    // Use the specific database ID from the config
    db = getFirestore(app!, firebaseConfig.firestoreDatabaseId || "(default)");
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// --- API Routes ---

// Get Topics
app.get("/api/v1/topics", async (req, res) => {
  try {
    if (!db) await initFirebase();
    if (!db) return res.status(503).json({ error: "Database not initialized" });

    const snapshot = await db.collection("topics").get();
    const topics = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(topics);
  } catch (error) {
    console.error("Fetch Topics Error:", error);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

// --- Vite Middleware ---

async function startServer() {
  console.log("Starting server initialization...");

  // Initialize Firebase in background
  initFirebase().catch((err) =>
    console.error("Background Firebase Init Error:", err),
  );

  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("Setting up Vite middleware...");
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: {
            port: 3001, // Use a different port for HMR internally if needed, but HMR is usually disabled
          },
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware mounted");
    } else {
      console.log("Setting up static file serving for production...");
      const distPath = path.join(__dirname, "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is LISTENING at http://0.0.0.0:${PORT}`);
    });

    server.on("error", (err) => {
      console.error("Server listen error:", err);
    });
  } catch (err) {
    console.error("CRITICAL: Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
