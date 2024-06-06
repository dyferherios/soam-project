// manage_event.js
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

// Fonction pour afficher le sous-menu

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
  
async function createEvent() {
  const ev_name = await askQuestion('Nom de l\'événement : ');
  const ev_description = await askQuestion('Description de l\'événement : ');
  const ev_date = await askQuestion('Date de l\'événement (YYYY-MM-DD) : ');
  const localisation = await askQuestion('Localisation de l\'événement : ');

  try {
    const result = await db.query(
      "INSERT INTO evenements (ev_name, ev_description, ev_date, localisation) VALUES ($1, $2, $3, $4) RETURNING *",
      [ev_name, ev_description, ev_date, localisation]
    );
    console.log('Événement créé avec succès :');
    console.table(result.rows);
  } catch (err) {
    console.error('Erreur lors de la création de l\'événement :', err.message);
  }
}

async function displayEvents() {
  try {
    const { rows } = await db.query('SELECT * FROM evenements');
    console.log('Événements :');
    console.table(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des événements :', err.message);
  }
}

async function modifyEvent() {
  const evenement_id = await askQuestion('ID de l\'événement à modifier : ');

  try {
    const { rows } = await db.query('SELECT * FROM evenements WHERE evenement_id = $1', [evenement_id]);
    if (rows.length === 0) {
      console.log('Aucun événement trouvé avec cet ID.');
      return;
    }

    const event = rows[0];
    const ev_name = await askQuestion(`Nom (${event.ev_name}) : `) || event.ev_name;
    const ev_description = await askQuestion(`Description (${event.ev_description}) : `) || event.ev_description;
    const ev_date = await askQuestion(`Date (${event.ev_date}) : `) || event.ev_date;
    const localisation = await askQuestion(`Localisation (${event.localisation}) : `) || event.localisation;

    await db.query(
      'UPDATE evenements SET ev_name = $1, ev_description = $2, ev_date = $3, localisation = $4 WHERE evenement_id = $5',
      [ev_name, ev_description, ev_date, localisation, evenement_id]
    );
    console.log('Événement modifié avec succès');
  } catch (err) {
    console.error('Erreur lors de la modification de l\'événement :', err.message);
  }
}

async function deleteEvent() {
  const evenement_id = await askQuestion('ID de l\'événement à supprimer : ');

  try {
    const result = await db.query('DELETE FROM evenements WHERE evenement_id = $1 RETURNING *', [evenement_id]);
    if (result.rowCount === 0) {
      console.log('Aucun événement trouvé avec cet ID.');
    } else {
      console.log('Événement supprimé avec succès');
    }
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'événement :', err.message);
  }
}

async function searchEvent() {
  const searchTerm = await askQuestion('Entrez un terme de recherche : ');

  try {
    const { rows } = await db.query(`
      SELECT * FROM evenements 
      WHERE ev_name ILIKE $1 
      OR ev_description ILIKE $1 
      OR localisation ILIKE $1 
      OR CAST(evenement_id AS TEXT) ILIKE $1 
      OR CAST(ev_date AS TEXT) ILIKE $1
    `, [`%${searchTerm}%`]);

    if (rows.length === 0) {
      console.log('Aucun événement trouvé.');
    } else {
      console.table(rows);
    }
  } catch (err) {
    console.error('Erreur lors de la recherche de l\'événement :', err.message);
  }
}

async function handleEvents() {
  let running = true;
  while (running) {
    showSubMenu('événements');
    const choice = await askQuestion('Choisissez une option : ');

    switch (choice) {
      case '1':
        await createEvent();
        break;
      case '2':
        await displayEvents();
        break;
      case '3':
        await modifyEvent();
        break;
      case '4':
        await deleteEvent();
        break;
      case '5':
        await searchEvent();
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
  handleEvents,
};
