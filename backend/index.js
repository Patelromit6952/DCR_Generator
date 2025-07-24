// server.js or app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
import { ObjectId } from 'mongodb';

dotenv.config();
const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
        error: true,
        success: false
      });
    }

    const db = await connectDB();
    const user = await db.collection("Users").findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not registered!",
        error: true,
        success: false
      });
    }

    return res.status(200).json({
      message: "Login successful",
      error: false,
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
app.post("/api/createSedB", async (req, res) => {
  const db = await connectDB();
  const data = await db
    .collection("Sed_B")
    .find()
    .sort({ schedule: 1 })
    .toArray();
  return res.status(200).json({ data });
});
app.post("/api/mainBuilding", async (req, res) => {
  const db = await connectDB();
  const data = await db.collection("MainBuilding").find().toArray();
  return res.status(200).json({ data });
});
app.post("/api/rccroad", async (req, res) => {
  const db = await connectDB();
  const data = await db.collection("RccRoad").find().toArray();
  return res.status(200).json({ data });
});
app.post("/api/paverblock", async (req, res) => {
  const db = await connectDB();
  const data = await db.collection("PaverBlock").find().toArray();
  return res.status(200).json({ data });
});
app.post("/api/esroom", async (req, res) => {
  const db = await connectDB();
  const data = await db.collection("EsRoom").find().toArray();
  return res.status(200).json({ data });
});
app.post("/api/securitycabin", async (req, res) => {
  const db = await connectDB();
  const data = await db.collection("SecurityCabin").find().toArray();
  return res.status(200).json({ data });
});
app.get("/api/quotations", async (req, res) => {
  try {
    const db = await connectDB();
    const quotations = await db
      .collection("Quotations")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: quotations,
      count: quotations.length
    });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching quotations",
      error: error.message
    });
  }
});
app.get("/api/quotations/:id", async (req, res) => {
  const db = await connectDB();
  const { id } = req.params;
  const quote = await db
    .collection("Quotations")
    .findOne({ _id: new ObjectId(id) });
  res.json({ success: true, data: quote });
});
app.put("/api/quotations/:id", async (req, res) => {
  const db = await connectDB();
  const { id } = req.params;
  const updateData = req.body;
  await db
    .collection("Quotations")
    .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  res.json({ success: true, message: "Quotation updated successfully" });
});
app.get('/api/recentquotations', async (req, res) => {
  try {
    const db = await connectDB();
    const quotations = await db.collection("Quotations")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5) 
      .toArray();

    const transformedQuotations = quotations.map(quote => {
      return {
        _id: quote._id,
        clientName: quote.clientDetails?.name || 'N/A',
        quotationType: quote.quotationType || 'N/A',
        amount: quote.summary.finalTotal || '0',
        quotationDate: quote.createdAt,
        status: quote.status || 'pending'
      };
    });

    res.json({
      success: true,
      data: transformedQuotations,
      count: transformedQuotations.length
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotations',
      error: error.message
    });
  }
});

app.post("/api/quotations/save", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Quotations"); // Use correct plural if needed

    const { quotationType, clientDetails, schedules, summary, status } =
      req.body;

    if (!quotationType) {
      return res.status(400).json({
        success: false,
        message: "quotationType is required"
      });
    }

    const quotationDoc = {
      quotationType,
      clientDetails,
      schedules,
      summary,
      status: status || "draft",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(quotationDoc);

    return res.status(200).json({
      success: true,
      message: "Quotation saved successfully",
      quotationId: result.insertedId,
      data: quotationDoc
    });
  } catch (error) {
    console.error("Error saving quotation:", error);
    res.status(500).json({
      success: false,
      message: "Error saving quotation",
      error: error.message
    });
  }
});

const PORT = 8000 || process.env.PORT;

const startServer = async () => {
  try {
    await connectDB(); // Ensures DB is connected before server starts
    app.listen(PORT,'0.0.0.0',() => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
  }
};

startServer();
