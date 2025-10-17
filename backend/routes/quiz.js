const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const Question = require('../models/Question');

// Fetch questions from MongoDB database
router.get('/questions', async (req, res) => {
  try {
    const { amount = 10, category = '', difficulty = '' } = req.query;
    const requestedAmount = parseInt(amount);

    // Construire le filtre de recherche
    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Récupérer toutes les questions correspondant au filtre
    let allQuestions = await Question.find(filter);

    // Stratégie de fallback intelligente
    if (allQuestions.length < requestedAmount) {
      if (category && difficulty) {
        // Essayer avec seulement la catégorie (priorité à la catégorie)
        console.log(`Pas assez de questions avec catégorie=${category} et difficulté=${difficulty}, recherche avec seulement la catégorie...`);
        const categoryQuestions = await Question.find({ category });
        if (categoryQuestions.length >= allQuestions.length) {
          allQuestions = categoryQuestions;
        }
      } else if (category) {
        // Si seulement la catégorie est sélectionnée, on garde strictement cette catégorie
        console.log(`Catégorie ${category} sélectionnée, on garde uniquement les questions de cette catégorie (${allQuestions.length} disponibles)`);
      } else if (difficulty) {
        // Si seulement la difficulté est sélectionnée, chercher toutes les questions de cette difficulté
        console.log(`Difficulté ${difficulty} sélectionnée, on garde uniquement cette difficulté`);
      }

      // Si toujours pas assez et AUCUN filtre n'est demandé, prendre toutes les questions
      if (allQuestions.length < requestedAmount && !category && !difficulty) {
        console.log(`Pas assez de questions, élargissement de la recherche...`);
        allQuestions = await Question.find({});
      }
    }

    // Si vraiment aucune question n'existe
    if (allQuestions.length === 0) {
      return res.status(404).json({ error: 'Aucune question trouvée dans la base de données' });
    }

    // Sélectionner aléatoirement le nombre de questions demandé (ou moins si pas assez)
    const selectedQuestions = [];
    const questionsPool = [...allQuestions];
    const numQuestions = Math.min(requestedAmount, questionsPool.length);

    for (let i = 0; i < numQuestions; i++) {
      const randomIndex = Math.floor(Math.random() * questionsPool.length);
      selectedQuestions.push(questionsPool[randomIndex]);
      questionsPool.splice(randomIndex, 1);
    }

    // Formater les questions au format attendu par le frontend
    const formattedQuestions = selectedQuestions.map(q => ({
      question: q.question,
      correct_answer: q.correct_answer,
      incorrect_answers: q.incorrect_answers,
      category: q.category,
      difficulty: q.difficulty
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error);
    res.status(500).json({ error: 'Échec de la récupération des questions' });
  }
});

// Get quiz categories from MongoDB
router.get('/categories', async (req, res) => {
  try {
    const categories = await Question.distinct('category');

    // Formater les catégories avec un ID numérique pour le frontend
    const formattedCategories = categories.map((cat, index) => ({
      id: index + 1,
      name: cat
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ error: 'Échec de la récupération des catégories' });
  }
});

// Save score
router.post('/scores', async (req, res) => {
  try {
    const { playerName, score, totalQuestions, category, difficulty } = req.body;

    if (!playerName || score === undefined || !totalQuestions || !category || !difficulty) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const newScore = new Score({
      playerName,
      score,
      totalQuestions,
      category,
      difficulty
    });

    await newScore.save();
    res.status(201).json(newScore);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du score:', error);
    res.status(500).json({ error: 'Échec de l\'enregistrement du score' });
  }
});

// Get top scores (leaderboard)
router.get('/scores', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const scores = await Score.find()
      .sort({ score: -1, createdAt: -1 })
      .limit(parseInt(limit));
    res.json(scores);
  } catch (error) {
    console.error('Erreur lors de la récupération des scores:', error);
    res.status(500).json({ error: 'Échec de la récupération des scores' });
  }
});

// Get statistics about questions
router.get('/stats', async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const categories = await Question.distinct('category');
    const difficulties = await Question.distinct('difficulty');

    const categoryStats = [];
    for (const category of categories) {
      const count = await Question.countDocuments({ category });
      categoryStats.push({ category, count });
    }

    const difficultyStats = [];
    for (const difficulty of difficulties) {
      const count = await Question.countDocuments({ difficulty });
      difficultyStats.push({ difficulty, count });
    }

    res.json({
      totalQuestions,
      categories: categoryStats,
      difficulties: difficultyStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Échec de la récupération des statistiques' });
  }
});

module.exports = router;
