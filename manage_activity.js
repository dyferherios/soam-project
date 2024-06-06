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
        4. Recherche
        5. Retour au menu principal
      `);
  }

async function handleActivities() {
    let running = true;
    while (running) {
      showSubMenu('activités');
      const choice = await askQuestion('Choisissez une option : ');
  
      switch (choice) {
        case '1':
          await createActivity();
          break;
        case '2':
          await displayActivities();
          break;
        case '3':
          await modifyActivity();
          break;
        case '4':
          await searchActivity();
          break;
        case '5':
          running = false;
          break;
        default:
          console.log('Choix invalide, veuillez réessayer.');
      }
    }
  }
  
  async function createActivity() {
    const ac_name = await askQuestion('Nom de l\'activité : ');
    const ac_description = await askQuestion('Description de l\'activité : ');
    const ac_date = await askQuestion('Date de l\'activité (YYYY-MM-DD) : ');
    const evenement_id = await askQuestion('ID de l\'événement associé : ');
  
    try {
      const result = await db.query(
        'INSERT INTO activities (ac_name, ac_description, ac_date, evenement_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [ac_name, ac_description, ac_date, evenement_id]
      );
      console.log('Activité créée avec succès :');
      console.table(result.rows);
    } catch (err) {
      if (err.code === '23503') {
        console.error('Erreur : L\'ID de l\'événement n\'existe pas.');
      } else if (err.code === '23502') {
        console.error('Erreur : Un champ obligatoire est manquant.');
      } else if (err.code === '22001') {
        console.error('Erreur : La valeur saisie est trop longue.');
      } else {
        console.error('Erreur lors de la création de l\'activité :', err.message);
      }
    }
  }
  
  async function displayActivities() {
    try {
      const { rows } = await db.query('SELECT * FROM activities');
      console.log('Activités :');
      console.table(rows);
    } catch (err) {
      console.error('Erreur lors de la récupération des activités :', err.message);
    }
  }
  
  async function modifyActivity() {
    const activity_id = await askQuestion('ID de l\'activité à modifier : ');
  
    try {
      const { rows } = await db.query('SELECT * FROM activities WHERE activity_id = $1', [activity_id]);
      if (rows.length === 0) {
        console.log('Aucune activité trouvée avec cet ID.');
        return;
      }
  
      const activity = rows[0];
      const ac_name = await askQuestion(`Nom (${activity.ac_name}) : `) || activity.ac_name;
      const ac_description = await askQuestion(`Description (${activity.ac_description}) : `) || activity.ac_description;
      const ac_date = await askQuestion(`Date (${activity.ac_date}) : `) || activity.ac_date;
      const evenement_id = await askQuestion(`ID de l'événement associé (${activity.evenement_id}) : `) || activity.evenement_id;
  
      await db.query(
        'UPDATE activities SET ac_name = $1, ac_description = $2, ac_date = $3, evenement_id = $4 WHERE activity_id = $5',
        [ac_name, ac_description, ac_date, evenement_id, activity_id]
      );
      console.log('Activité modifiée avec succès');
    } catch (err) {
      if (err.code === '23503') {
        console.error('Erreur : L\'ID de l\'événement n\'existe pas.');
      } else if (err.code === '22001') {
        console.error('Erreur : La valeur saisie est trop longue.');
      } else {
        console.error('Erreur lors de la modification de l\'activité :', err.message);
      }
    }
  }

  async function searchActivity() {
    const searchTerm = await askQuestion('Entrez un terme de recherche : ');
  
    try {
      const { rows } = await db.query(`
        SELECT * FROM activities 
        WHERE ac_name ILIKE $1 
        OR ac_description ILIKE $1 
        OR CAST(ac_date AS TEXT) ILIKE $1 
        OR CAST(evenement_id AS TEXT) ILIKE $1 
        OR CAST(activity_id AS TEXT) ILIKE $1
      `, [`%${searchTerm}%`]);
  
      if (rows.length === 0) {
        console.log('Aucune activité trouvée.');
      } else {
        console.table(rows);
      }
    } catch (err) {
      console.error('Erreur lors de la recherche de l\'activité :', err.message);
    }
  }
  
module.exports = {handleActivities,};