// manage_finances.js
const db = require('./db');
const readline = require('readline');

// Fonction pour poser une question à l'utilisateur et attendre la réponse
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

function showSubMenu(section) {
    console.log(`
        Gestion des ${section} :
        1. Insertion
        2. Afficher
        3. Modifier
        4. Supprimer
        5. Recherche
        6. Retour au menu principal
      `);
  }
async function createFinance() {
  const fin_categories = await askQuestion('Catégorie financière (A/B/C) : ');
  const amount = await askQuestion('Montant : ');
  const fin_description = await askQuestion('Description financière : ');
  const donator_id = await askQuestion('ID du donateur : ');
  const ressource_id = await askQuestion('ID de la ressource : ');

  try {
    const result = await db.query(
      "INSERT INTO finances (fin_categories, amount, fin_description, donator_id, ressource_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [fin_categories, amount, fin_description, donator_id, ressource_id]
    );
    console.log('Entrée financière créée avec succès :');
    console.table(result.rows);
  } catch (err) {
    console.error('Erreur lors de la création de l\'entrée financière :', err.message);
  }
}

async function displayFinances() {
  try {
    const { rows } = await db.query('SELECT * FROM finances');
    console.log('Entrées financières :');
    console.table(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des entrées financières :', err.message);
  }
}

async function modifyFinance() {
  const finances_id = await askQuestion('ID de l\'entrée financière à modifier : ');

  try {
    const { rows } = await db.query('SELECT * FROM finances WHERE finances_id = $1', [finances_id]);
    if (rows.length === 0) {
      console.log('Aucune entrée financière trouvée avec cet identifiant.');
      return;
    }

    const new_fin_categories = await askQuestion(`Nouvelle catégorie (${rows[0].fin_categories}) : `) || rows[0].fin_categories;
    const new_amount = await askQuestion(`Nouveau montant (${rows[0].amount}) : `) || rows[0].amount;
    const new_fin_description = await askQuestion(`Nouvelle description (${rows[0].fin_description}) : `) || rows[0].fin_description;
    const new_donator_id = await askQuestion(`Nouveau donateur (${rows[0].donator_id}) : `) || rows[0].donator_id;
    const new_ressource_id = await askQuestion(`Nouvelle ressource (${rows[0].ressource_id}) : `) || rows[0].ressource_id;

    await db.query(
      'UPDATE finances SET fin_categories = $1, amount = $2, fin_description = $3, donator_id = $4, ressource_id = $5 WHERE finances_id = $6',
      [new_fin_categories, new_amount, new_fin_description, new_donator_id, new_ressource_id, finances_id]
    );
    console.log('Entrée financière modifiée avec succès');
  } catch (err) {
    console.error('Erreur lors de la modification de l\'entrée financière :', err.message);
  }
}

async function deleteFinance() {
  const finances_id = await askQuestion('ID de l\'entrée financière à supprimer : ');

  try {
    const result = await db.query('DELETE FROM finances WHERE finances_id = $1 RETURNING *', [finances_id]);
    if (result.rowCount === 0) {
      console.log('Aucune entrée financière trouvée avec cet identifiant.');
    } else {
      console.log('Entrée financière supprimée avec succès');
    }
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'entrée financière :', err.message);
  }
}

async function searchFinance() {
  const searchTerm = await askQuestion('Entrez un terme de recherche : ');

  try {
    const { rows } = await db.query(`
      SELECT * FROM finances 
      WHERE fin_categories ILIKE $1 
      OR CAST(amount AS TEXT) ILIKE $1 
      OR fin_description ILIKE $1 
      OR CAST(donator_id AS TEXT) ILIKE $1 
      OR CAST(ressource_id AS TEXT) ILIKE $1 
      OR CAST(finances_id AS TEXT) ILIKE $1
    `, [`%${searchTerm}%`]);

    if (rows.length === 0) {
      console.log('Aucune entrée financière trouvée.');
    } else {
      console.table(rows);
    }
  } catch (err) {
    console.error('Erreur lors de la recherche de l\'entrée financière :', err.message);
  }
}

async function handleFinances() {
  let running = true;
  while (running) {
    showSubMenu('finances');
    const choice = await askQuestion('Choisissez une option : ');

    switch (choice) {
      case '1':
        await createFinance();
        break;
      case '2':
        await displayFinances();
        break;
      case '3':
        await modifyFinance();
        break;
      case '4':
        await deleteFinance();
        break;
      case '5':
        await searchFinance();
        break;
      case '6':
        running = false;
        break;
      default:
        console.log('Choix invalide, veuillez réessayer.');
    }
  }
}

module.exports = {
  handleFinances,
};
