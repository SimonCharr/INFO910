const mongoose = require('mongoose');
const Question = require('./models/Question');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp';

const questionsData = [
  // Culture générale - Easy
  {
    question: "Quelle est la capitale de la France ?",
    correct_answer: "Paris",
    incorrect_answers: ["Lyon", "Marseille", "Toulouse"],
    category: "Culture Générale",
    difficulty: "easy"
  },
  {
    question: "Combien de continents y a-t-il sur Terre ?",
    correct_answer: "7",
    incorrect_answers: ["5", "6", "8"],
    category: "Géographie",
    difficulty: "easy"
  },
  {
    question: "Quel est le plus grand océan du monde ?",
    correct_answer: "L'océan Pacifique",
    incorrect_answers: ["L'océan Atlantique", "L'océan Indien", "L'océan Arctique"],
    category: "Géographie",
    difficulty: "easy"
  },
  {
    question: "Combien font 5 x 6 ?",
    correct_answer: "30",
    incorrect_answers: ["25", "35", "40"],
    category: "Mathématiques",
    difficulty: "easy"
  },
  {
    question: "Quel animal est le roi de la jungle ?",
    correct_answer: "Le lion",
    incorrect_answers: ["Le tigre", "L'éléphant", "Le gorille"],
    category: "Nature",
    difficulty: "easy"
  },

  // Culture générale - Medium
  {
    question: "En quelle année a eu lieu la Révolution française ?",
    correct_answer: "1789",
    incorrect_answers: ["1799", "1889", "1689"],
    category: "Histoire",
    difficulty: "medium"
  },
  {
    question: "Qui a peint la Joconde ?",
    correct_answer: "Léonard de Vinci",
    incorrect_answers: ["Michel-Ange", "Raphaël", "Botticelli"],
    category: "Art",
    difficulty: "medium"
  },
  {
    question: "Quelle est la planète la plus proche du Soleil ?",
    correct_answer: "Mercure",
    incorrect_answers: ["Vénus", "Mars", "La Terre"],
    category: "Sciences",
    difficulty: "medium"
  },
  {
    question: "Qui a écrit 'Les Misérables' ?",
    correct_answer: "Victor Hugo",
    incorrect_answers: ["Émile Zola", "Gustave Flaubert", "Honoré de Balzac"],
    category: "Littérature",
    difficulty: "medium"
  },
  {
    question: "Combien de côtés a un hexagone ?",
    correct_answer: "6",
    incorrect_answers: ["5", "7", "8"],
    category: "Mathématiques",
    difficulty: "medium"
  },

  // Sciences - Medium
  {
    question: "Quel est le symbole chimique de l'or ?",
    correct_answer: "Au",
    incorrect_answers: ["Or", "Ag", "Go"],
    category: "Sciences",
    difficulty: "medium"
  },
  {
    question: "Combien d'os y a-t-il dans le corps humain adulte ?",
    correct_answer: "206",
    incorrect_answers: ["186", "226", "256"],
    category: "Sciences",
    difficulty: "medium"
  },
  {
    question: "Quelle est la vitesse de la lumière dans le vide ?",
    correct_answer: "300 000 km/s",
    incorrect_answers: ["150 000 km/s", "450 000 km/s", "600 000 km/s"],
    category: "Physique",
    difficulty: "hard"
  },

  // Histoire - Hard
  {
    question: "Qui était le premier empereur de Rome ?",
    correct_answer: "Auguste",
    incorrect_answers: ["Jules César", "Néron", "Caligula"],
    category: "Histoire",
    difficulty: "hard"
  },
  {
    question: "En quelle année a été signée la Déclaration d'indépendance des États-Unis ?",
    correct_answer: "1776",
    incorrect_answers: ["1766", "1786", "1796"],
    category: "Histoire",
    difficulty: "hard"
  },

  // Sport - Easy
  {
    question: "Combien de joueurs composent une équipe de football sur le terrain ?",
    correct_answer: "11",
    incorrect_answers: ["10", "12", "9"],
    category: "Sport",
    difficulty: "easy"
  },
  {
    question: "Quel sport pratique-t-on à Roland-Garros ?",
    correct_answer: "Le tennis",
    incorrect_answers: ["Le football", "Le rugby", "Le basketball"],
    category: "Sport",
    difficulty: "easy"
  },

  // Sport - Medium
  {
    question: "Combien de médailles d'or Michael Phelps a-t-il remportées aux Jeux Olympiques ?",
    correct_answer: "23",
    incorrect_answers: ["20", "25", "18"],
    category: "Sport",
    difficulty: "medium"
  },
  {
    question: "En quelle année la France a-t-elle gagné la Coupe du Monde de football pour la première fois ?",
    correct_answer: "1998",
    incorrect_answers: ["1996", "2000", "2002"],
    category: "Sport",
    difficulty: "medium"
  },

  // Cinéma - Easy
  {
    question: "Qui a réalisé le film 'Titanic' ?",
    correct_answer: "James Cameron",
    incorrect_answers: ["Steven Spielberg", "Christopher Nolan", "Martin Scorsese"],
    category: "Cinéma",
    difficulty: "easy"
  },
  {
    question: "Quel est le nom du lion dans 'Le Roi Lion' ?",
    correct_answer: "Simba",
    incorrect_answers: ["Mufasa", "Scar", "Timon"],
    category: "Cinéma",
    difficulty: "easy"
  },

  // Cinéma - Medium
  {
    question: "Combien d'Oscars le film 'Le Seigneur des Anneaux : Le Retour du Roi' a-t-il remportés ?",
    correct_answer: "11",
    incorrect_answers: ["9", "13", "10"],
    category: "Cinéma",
    difficulty: "medium"
  },
  {
    question: "Quel acteur joue Iron Man dans l'univers Marvel ?",
    correct_answer: "Robert Downey Jr.",
    incorrect_answers: ["Chris Evans", "Chris Hemsworth", "Mark Ruffalo"],
    category: "Cinéma",
    difficulty: "medium"
  },

  // Musique - Easy
  {
    question: "Qui a chanté 'Thriller' ?",
    correct_answer: "Michael Jackson",
    incorrect_answers: ["Prince", "Elvis Presley", "Freddie Mercury"],
    category: "Musique",
    difficulty: "easy"
  },
  {
    question: "Combien de cordes a une guitare classique ?",
    correct_answer: "6",
    incorrect_answers: ["5", "7", "8"],
    category: "Musique",
    difficulty: "easy"
  },

  // Technologie - Easy
  {
    question: "Qu'est-ce que HTML ?",
    correct_answer: "Un langage de balisage",
    incorrect_answers: ["Un langage de programmation", "Un système d'exploitation", "Un navigateur web"],
    category: "Technologie",
    difficulty: "easy"
  },
  {
    question: "Qui est le fondateur de Microsoft ?",
    correct_answer: "Bill Gates",
    incorrect_answers: ["Steve Jobs", "Mark Zuckerberg", "Elon Musk"],
    category: "Technologie",
    difficulty: "easy"
  },

  // Technologie - Medium
  {
    question: "Quelle entreprise a développé le système d'exploitation Android ?",
    correct_answer: "Google",
    incorrect_answers: ["Apple", "Samsung", "Microsoft"],
    category: "Technologie",
    difficulty: "medium"
  },
  {
    question: "Que signifie l'acronyme CPU ?",
    correct_answer: "Central Processing Unit",
    incorrect_answers: ["Computer Personal Unit", "Central Program Unit", "Computer Processing Unit"],
    category: "Technologie",
    difficulty: "medium"
  },

  // Gastronomie - Easy
  {
    question: "Quel est l'ingrédient principal du guacamole ?",
    correct_answer: "L'avocat",
    incorrect_answers: ["La tomate", "Le poivron", "Le concombre"],
    category: "Gastronomie",
    difficulty: "easy"
  },
  {
    question: "De quel pays vient le sushi ?",
    correct_answer: "Le Japon",
    incorrect_answers: ["La Chine", "La Corée", "La Thaïlande"],
    category: "Gastronomie",
    difficulty: "easy"
  },

  // Plus de questions variées
  {
    question: "Quelle est la monnaie utilisée au Japon ?",
    correct_answer: "Le yen",
    incorrect_answers: ["Le yuan", "Le won", "Le baht"],
    category: "Culture Générale",
    difficulty: "easy"
  },
  {
    question: "Combien de dents a un adulte humain normalement ?",
    correct_answer: "32",
    incorrect_answers: ["28", "30", "34"],
    category: "Sciences",
    difficulty: "easy"
  },
  {
    question: "Quel est le plus haut sommet du monde ?",
    correct_answer: "L'Everest",
    incorrect_answers: ["Le K2", "Le Kilimandjaro", "Le Mont Blanc"],
    category: "Géographie",
    difficulty: "easy"
  },
  {
    question: "Qui a découvert l'Amérique en 1492 ?",
    correct_answer: "Christophe Colomb",
    incorrect_answers: ["Amerigo Vespucci", "Ferdinand Magellan", "Vasco de Gama"],
    category: "Histoire",
    difficulty: "easy"
  },
  {
    question: "Quelle est la langue la plus parlée au monde ?",
    correct_answer: "Le mandarin",
    incorrect_answers: ["L'anglais", "L'espagnol", "L'hindi"],
    category: "Culture Générale",
    difficulty: "medium"
  },
  {
    question: "Combien de touches a un piano standard ?",
    correct_answer: "88",
    incorrect_answers: ["76", "92", "100"],
    category: "Musique",
    difficulty: "medium"
  },
  {
    question: "Quel est le plus petit pays du monde ?",
    correct_answer: "Le Vatican",
    incorrect_answers: ["Monaco", "Saint-Marin", "Le Liechtenstein"],
    category: "Géographie",
    difficulty: "medium"
  },
  {
    question: "Qui a inventé l'ampoule électrique ?",
    correct_answer: "Thomas Edison",
    incorrect_answers: ["Nikola Tesla", "Benjamin Franklin", "Alexander Graham Bell"],
    category: "Sciences",
    difficulty: "medium"
  },
  {
    question: "Quelle est la durée d'une partie de football professionnel ?",
    correct_answer: "90 minutes",
    incorrect_answers: ["80 minutes", "100 minutes", "120 minutes"],
    category: "Sport",
    difficulty: "easy"
  },
  {
    question: "Quel est le symbole chimique de l'eau ?",
    correct_answer: "H2O",
    incorrect_answers: ["O2", "CO2", "H2"],
    category: "Sciences",
    difficulty: "easy"
  }
];

async function seedDatabase() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connecté à MongoDB');

    console.log('Suppression des anciennes questions...');
    await Question.deleteMany({});
    console.log('✓ Anciennes questions supprimées');

    console.log('Ajout des nouvelles questions en français...');
    await Question.insertMany(questionsData);
    console.log(`✓ ${questionsData.length} questions ajoutées avec succès`);

    // Afficher les statistiques
    const categories = await Question.distinct('category');
    console.log(`\nCatégories disponibles : ${categories.join(', ')}`);

    for (const category of categories) {
      const count = await Question.countDocuments({ category });
      console.log(`  - ${category} : ${count} questions`);
    }

    console.log('\n✓ Base de données initialisée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('✗ Erreur lors de l\'initialisation :', error);
    process.exit(1);
  }
}

seedDatabase();
