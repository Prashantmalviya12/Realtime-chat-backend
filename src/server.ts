import "dotenv/config";
import app from "./app";
import { sequelize } from "./config/database";
import "./models";
import "./config/firebase";

const PORT = Number(process.env.PORT || 5000);

const startServer = async (): Promise<void> => {
  try {
    console.log("firebase",process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");

    // For a machine test/demo. In production, use versioned Sequelize migrations.
    await sequelize.sync();
    console.log("Database models synchronized");

    app.listen(PORT, () => {
      console.log(`Chat backend listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
};

void startServer();
