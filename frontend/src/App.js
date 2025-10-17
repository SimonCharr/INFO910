import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [screen, setScreen] = useState('home'); // 'home', 'quiz', 'result', 'leaderboard'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchLeaderboard();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/quiz/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/quiz/scores?limit=10`);
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const startQuiz = async () => {
    if (!playerName.trim()) {
      setError('Veuillez entrer votre nom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/quiz/questions`, {
        params: {
          amount: 10,
          category: selectedCategory,
          difficulty: selectedDifficulty
        }
      });

      const questionsWithAnswers = response.data.map(q => ({
        ...q,
        allAnswers: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5)
      }));

      setQuestions(questionsWithAnswers);
      setScreen('quiz');
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowResult(false);
    } catch (err) {
      setError('Impossible de charger les questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (answer) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const currentQuestion = questions[currentQuestionIndex];
    if (answer === currentQuestion.correct_answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      saveScore();
      setScreen('result');
    }
  };

  const saveScore = async () => {
    try {
      // selectedCategory contient déjà le nom de la catégorie (pas un ID)
      const categoryName = selectedCategory || 'Toutes catégories';
      await axios.post(`${API_URL}/quiz/scores`, {
        playerName,
        score,
        totalQuestions: questions.length,
        category: categoryName,
        difficulty: selectedDifficulty || 'toutes'
      });
      fetchLeaderboard();
    } catch (err) {
      console.error('Error saving score:', err);
    }
  };

  const resetQuiz = () => {
    setScreen('home');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setError(null);
  };

  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const translateDifficulty = (difficulty) => {
    const translations = {
      'easy': 'Facile',
      'medium': 'Moyen',
      'hard': 'Difficile',
      'toutes': 'Toutes'
    };
    return translations[difficulty] || difficulty;
  };

  // Home Screen
  if (screen === 'home') {
    return (
      <div className="App">
        <div className="container">
          <h1>🧠 Quiz Master</h1>
          <p className="subtitle">Testez vos connaissances !</p>

          {error && <div className="error">{error}</div>}

          <div className="quiz-setup">
            <input
              type="text"
              placeholder="Entrez votre nom..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="input"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input"
            >
              <option value="">Toutes les difficultés</option>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>

            <button
              onClick={startQuiz}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Chargement...' : 'Commencer le Quiz'}
            </button>

            <button
              onClick={() => setScreen('leaderboard')}
              className="btn btn-secondary"
            >
              Voir le Classement
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (screen === 'quiz') {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="App">
        <div className="container">
          <div className="quiz-header">
            <h2>Question {currentQuestionIndex + 1} / {questions.length}</h2>
            <p className="score">Score: {score}</p>
          </div>

          <div className="question-card">
            <p className="difficulty">{translateDifficulty(currentQuestion.difficulty)}</p>
            <h3>{decodeHTML(currentQuestion.question)}</h3>

            <div className="answers">
              {currentQuestion.allAnswers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(answer)}
                  disabled={showResult}
                  className={`answer-btn ${
                    showResult
                      ? answer === currentQuestion.correct_answer
                        ? 'correct'
                        : answer === selectedAnswer
                        ? 'incorrect'
                        : ''
                      : ''
                  }`}
                >
                  {decodeHTML(answer)}
                </button>
              ))}
            </div>

            {showResult && (
              <div className="result-feedback">
                {selectedAnswer === currentQuestion.correct_answer ? (
                  <p className="correct-text">✓ Correct !</p>
                ) : (
                  <p className="incorrect-text">✗ Incorrect ! La bonne réponse était : {decodeHTML(currentQuestion.correct_answer)}</p>
                )}
                <button onClick={nextQuestion} className="btn btn-primary">
                  {currentQuestionIndex < questions.length - 1 ? 'Question Suivante' : 'Voir les Résultats'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Result Screen
  if (screen === 'result') {
    const percentage = ((score / questions.length) * 100).toFixed(0);

    return (
      <div className="App">
        <div className="container">
          <h1>Quiz Terminé !</h1>
          <div className="result-card">
            <h2>{playerName}</h2>
            <p className="final-score">Score : {score} / {questions.length}</p>
            <p className="percentage">{percentage}%</p>

            <div className="result-actions">
              <button onClick={resetQuiz} className="btn btn-primary">
                Rejouer
              </button>
              <button onClick={() => setScreen('leaderboard')} className="btn btn-secondary">
                Voir le Classement
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Leaderboard Screen
  if (screen === 'leaderboard') {
    return (
      <div className="App">
        <div className="container">
          <h1>🏆 Classement</h1>
          <p className="subtitle">Top 10 des meilleurs scores</p>

          <div className="leaderboard">
            {leaderboard.length === 0 ? (
              <p className="empty-state">Aucun score pour le moment. Soyez le premier !</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Rang</th>
                    <th>Joueur</th>
                    <th>Score</th>
                    <th>Catégorie</th>
                    <th>Difficulté</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry._id}>
                      <td>{index + 1}</td>
                      <td>{entry.playerName}</td>
                      <td>{entry.score}/{entry.totalQuestions}</td>
                      <td>{entry.category}</td>
                      <td>{translateDifficulty(entry.difficulty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <button onClick={resetQuiz} className="btn btn-primary">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
