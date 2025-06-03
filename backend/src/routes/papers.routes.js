import express from "express";
import axios from "axios";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    
    const { topic = "ai", max_results = 5, start = 0 } = req.query;
    
    
    const response = await axios.get(
      `http://export.arxiv.org/api/query?search_query=all:${topic}&start=${start}&max_results=${max_results}`
    );
    
   
    res.send(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching papers");
  }
});

export default router;
