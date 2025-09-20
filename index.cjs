const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();
const abi = require("./abi.json");

const app = express();
app.use(express.json());

// --- CONFIGURATION ---
const PORT = 3000;
const { API_URL, PRIVATE_KEY, CONTRACT_ADDRESS_URL } = process.env;
// 👇 PASTE YOUR *NEW* DEPLOYED CONTRACT ADDRESS HERE AFTER YOU RE-DEPLOY
const CONTRACT_ADDRESS = CONTRACT_ADDRESS_URL;

// --- Ethers.js Setup ---
const provider = new ethers.JsonRpcProvider(API_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// --- API ENDPOINTS ---

// GET all tourists
app.get("/tourists", async (req, res) => {
  try {
    const allTourists = await contract.getAllTourists();
    // Helper to format the BigInts from Solidity into numbers/strings
    const formatTourist = (t) => ({
        touristId: Number(t.touristId).toString().padStart(6, '0'), // Format to 6 digits
        adhaarNo: t.adhaarNo,
        bandId: t.bandId,
        groupId: t.groupId,
        locations: t.locations,
        duration: Number(t.duration),
        owner: t.owner
    });
    const formattedTourists = allTourists.map(formatTourist);
    res.json(formattedTourists);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// GET a single tourist by ID
app.get("/tourists/:id", async (req, res) => {
    try {
        const t = await contract.getTourist(req.params.id);
        res.json({
            touristId: Number(t.touristId).toString().padStart(6, '0'), // Format to 6 digits
            adhaarNo: t.adhaarNo,
            bandId: t.bandId,
            groupId: t.groupId,
            locations: t.locations,
            duration: Number(t.duration),
            owner: t.owner
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

// POST (Create) a new tourist
app.post("/tourists", async (req, res) => {
  try {
    // We no longer get touristId from the request body
    const { adhaarNo, bandId, groupId, locations, duration } = req.body;
    
    // Call the new `createTourist` function.
    // If a value is not provided, pass a default empty value.
    const tx = await contract.createTourist(
        adhaarNo || "", 
        bandId || "", 
        groupId || "", 
        locations || [], 
        duration || 0
    );

    // Wait for the transaction to be mined and get the receipt
    const receipt = await tx.wait();

    // Find the 'TouristCreated' event in the transaction logs
    const touristCreatedEvent = receipt.logs.find(log => {
      try {
        const parsedLog = contract.interface.parseLog(log);
        return parsedLog && parsedLog.name === "TouristCreated";
      } catch (error) {
        return false;
      }
    });

    if (!touristCreatedEvent) {
      return res.status(500).send({ message: "Could not find TouristCreated event." });
    }

    // Extract the new touristId from the event arguments
    const newTouristId = touristCreatedEvent.args[0];

    res.status(201).send({ 
      message: "Tourist created successfully", 
      touristId: Number(newTouristId).toString().padStart(6, '0'), // Format to 6 digits
      txHash: tx.hash 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// DELETE a tourist
app.delete("/tourists/:id", async (req, res) => {
    try {
        const tx = await contract.deleteTourist(req.params.id);
        await tx.wait();
        res.send({ message: "Tourist deleted successfully", txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
