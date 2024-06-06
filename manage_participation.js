// manage_participation.js
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
  console.log(`\n  Gestion des ${section} :`);
  console.log('  1. Insertion');
  console.log('  2. Afficher');
  console.log('  3. Modifier');
  console.log('  4. Supprimer');
  console.log('  5. Recherche');
  console.log('  6. Retour au menu principal');
}

async function createParticipation() {
  const member_id = await askQuestion('ID du membre : ');
  const evenement_id = await askQuestion('ID de l\'événement : ');
  const activity_id = await askQuestion('ID de l\'activité : ');

  try {
    const result = await db.query(
      "INSERT INTO participations (member_id, evenement_id, activity_id) VALUES ($1, $2, $3) RETURNING *",
      [member_id, evenement_id, activity_id]
    );
    console.log('Participation créée avec succès :');
    console.table(result.rows);
  } catch (err) {
    console.error('Erreur lors de la création de la participation :', err.message);
  }
}

async function displayParticipations() {
  try {
    const { rows } = await db.query('SELECT * FROM participations');
    console.log('Participations :');
    console.table(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des participations :', err.message);
  }
}

async function modifyParticipation() {
  const member_id = await askQuestion('ID du membre de la participation à modifier : ');
  const evenement_id = await askQuestion('ID de l\'événement de la participation à modifier : ');
  const activity_id = await askQuestion('ID de l\'activité de la participation à modifier : ');

  try {
    const { rows } = await db.query('SELECT * FROM participations WHERE member_id = $1 AND evenement_id = $2 AND activity_id = $3', [member_id, evenement_id, activity_id]);
    if (rows.length === 0) {
      console.log('Aucune participation trouvée avec ces identifiants.');
      return;
    }

    const new_member_id = await askQuestion(`Nouveau ID du membre (${member_id}) : `) || member_id;
    const new_evenement_id = await askQuestion(`Nouveau ID de l'événement (${evenement_id}) : `) || evenement_id;
    const new_activity_id = await askQuestion(`Nouveau ID de l'activité (${activity_id}) : `) || activity_id;

    await db.query(
      'UPDATE participations SET member_id = $1, evenement_id = $2, activity_id = $3 WHERE member_id = $4 AND evenement_id = $5 AND activity_id = $6',
      [new_member_id, new_evenement_id, new_activity_id, member_id, evenement_id, activity_id]
    );
    console.log('Participation modifiée avec succès');
  } catch (err) {
    console.error('Erreur lors de la modification de la participation :', err.message);
  }
}

async function deleteParticipation() {
  const member_id = await askQuestion('ID du membre de la participation à supprimer : ');
  const evenement_id = await askQuestion('ID de l\'événement de la participation à supprimer : ');
  const activity_id = await askQuestion('ID de l\'activité de la participation à supprimer : ');

  try {
    const result = await db.query('DELETE FROM participations WHERE member_id = $1 AND evenement_id = $2 AND activity_id = $3 RETURNING *', [member_id, evenement_id, activity_id]);
    if (result.rowCount === 0) {
      console.log('Aucune participation trouvée avec ces identifiants.');
    } else {
      console.log('Participation supprimée avec succès');
    }
  } catch (err) {
    console.error('Erreur lors de la suppression de la participation :', err.message);
  }
}

async function searchParticipation() {
  const searchTerm = await askQuestion('Entrez un terme de recherche : ');

  try {
    const { rows } = await db.query(`
      SELECT * FROM participations 
      WHERE CAST(member_id AS TEXT) ILIKE $1 
      OR CAST(evenement_id AS TEXT) ILIKE $1 
      OR CAST(activity_id AS TEXT) ILIKE $1
    `, [`%${searchTerm}%`]);

    if (rows.length === 0) {
      console.log('Aucune participation trouvée.');
    } else {
      console.table(rows);
    }
  } catch (err) {
    console.error('Erreur lors de la recherche de la participation :', err.message);
  }
}

async function handleParticipations() {
  let running = true;
  while (running) {
    showSubMenu('participations');
    const choice = await askQuestion('Choisissez une option : ');

    switch (choice) {
      case '1':
        await createParticipation();
        break;
      case '2':
        await displayParticipations();
        break;
      case '3':
        await modifyParticipation();
        break;
      case '4':
        await deleteParticipation();
        break;
      case '5':
        await searchParticipation();
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
  handleParticipations,
};
