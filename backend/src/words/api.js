import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

export default function createWordsApi(db) {
  const words = db.collection("words");

  // Get all word groups
  // Output is array of all words in the tree
  // Example usage:
  // GET http://localhost:3000/words ==> Outputs all existing words
  router.get("/", async (req, res) => {
  try {
      const result = await words.find({}).toArray();

      res.json(result);
  } catch (error) {
      res.status(500).json({
      message: "Failed to retrieve words",
      error: error.message
       });
   }
   });

  // Add a new word group
  // Input is an Array called Translations: [Language: Words(Array)]
  // Outut is an Array with ID, Translation
  // Example usage:
  // POST http://localhost:3000/words `
  //   -H "Content-Type: application/json" `
  //   -d '{\"translations\":[{\"language\":\"en\",\"words\":[\"house\",\"home\"]},{\"language\":\"ja\",\"words\":[\"家\",\"住宅\"]}]}'     
  
  router.post("/", async (req, res) => {
  try {
    const translations = req.body.translations;

    if (!translations || !Array.isArray(translations)) {
      return res.status(400).json({
        message: "Translations are required"
      });
    }

    const allWords = translations.flatMap(t => t.words);

    const existing = await words.findOne({
      "translations.words": { $in: allWords }
    });

    if (existing) {
      return res.status(409).json({
        message: "One or more words already exist",
        existingGroup: existing
      });
    }

    const result = await words.insertOne({
      translations
    });

    res.status(201).json({
      message: "Word group added",
      id: result.insertedId
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add word group",
      error: error.message
    });
  }
});

  // Look up a word
  // Input: Word
  // Output: The translation Array
  // Example usage:
  // http://localhost:3000/words/house ==> outputs the group for "house"

  router.get("/:word", async (req, res) => {
    try {
      const result = await words.findOne({
        "translations.words": req.params.word
      });

      if (!result) {
        return res.status(404).json({
          message: "Word not found"
        });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to look up word",
        error: error.message
      });
    }
  });

  // Add a translation to an existing word group
  //Important: link will be https....../words/<WORDID>/translations
  // Input: WORD ID (in the link, not in the actual package), array: [Language: word(s)] 
  //Example usage:
  //PATCH "http://localhost:3000/words/6a7d9d02174c7409ba88052e/translations" `
  //   -H "Content-Type: application/json" `
  //   -d '{\"language\":\"id\",\"words\":[\"rumah\"]}'


  router.patch("/:id/translations", async (req, res) => {
    try {
      const result = await words.updateOne(
        {
          _id: new ObjectId(req.params.id)
        },
        {
          $push: {
            translations: {
              language: req.body.language,
              words: req.body.words
            }
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          message: "Word group not found"
        });
      }

      res.json({
        message: "Translation added"
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to add translation",
        error: error.message
      });
    }
  });

  return router;
}