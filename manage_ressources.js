// manage_resources.js
const db = require('./db');
const readline = require('readline');


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
  console.log(`\n  Gestion des ${section} :`);
  console.log('  1. Insertion');
  console.log('  2. Afficher');
  console.log('  3. Modifier');
  console.log('  4. Supprimer');
  console.log('  5. Recherche');
  console.log('  6. Retour au menu principal');
}

async function createResource() {
  const res_type = await askQuestion('Type de ressource : ');
  const res_description = await askQuestion('Description de la ressource : ');
  const res_count = await askQuestion('Quantité de la ressource : ');

  try {
    const result = await db.query(
      "INSERT INTO ressources (res_type, res_description, res_count) VALUES ($1, $2, $3) RETURNING *",
      [res_type, res_description, res_count]
    );
    console.log('Ressource créée avec succès :');
    console.table(result.rows);
  } catch (err) {
    console.error('Erreur lors de la création de la ressource :', err.message);
  }
}

async function displayResources() {
  try {
    const { rows } = await db.query('SELECT * FROM ressources');
    console.log('Ressources :');
    console.table(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des ressources :', err.message);
  }
}

async function modifyResource() {
  const ressource_id = await askQuestion('ID de la ressource à modifier : ');

  try {
    const { rows } = await db.query('SELECT * FROM ressources WHERE ressource_id = $1', [ressource_id]);
    if (rows.length === 0) {
      console.log('Aucune ressource trouvée avec cet identifiant.');
      return;
    }
    const new_res_type = await askQuestion(`Nouveau type de ressource (${rows[0].res_type}) : `) || rows[0].res_type;
    const new_res_description = await askQuestion(`Nouvelle description (${rows[0].res_description}) : `) || rows[0].res_description;
    const new_res_count = await askQuestion(`Nouvelle quantité (${rows[0].res_count}) : `) || rows[0].res_count;
    await db.query(
      'UPDATE ressources SET res_type = $1, res_description = $2, res_count = $3 WHERE ressource_id = $4',
      [new_res_type, new_res_description, new_res_count, ressource_id]
    );
    console.log('Ressource modifiée avec succès');
  } catch (err) {
    console.error('Erreur lors de la modification de la ressource :', err.message);
  }
}

async function deleteResource() {
  const ressource_id = await askQuestion('ID de la ressource à supprimer : ');

  try {
    const result = await db.query('DELETE FROM ressources WHERE ressource_id = $1 RETURNING *', [ressource_id]);
    if (result.rowCount === 0) {
      console.log('Aucune ressource trouvée avec cet identifiant.');
    } else {
      console.log('Ressource supprimée avec succès');
    }
  } catch (err) {
    console.error('Erreur lors de la suppression de la ressource :', err.message);
  }
}

async function searchResource() {
  const searchTerm = await askQuestion('Entrez un terme de recherche : ');

  try {
    const { rows } = await db.query(`
      SELECT * FROM ressources 
      WHERE res_type ILIKE $1 
      OR res_description ILIKE $1 
      OR CAST(res_count AS TEXT) ILIKE $1 
      OR CAST(ressource_id AS TEXT) ILIKE $1
    `, [`%${searchTerm}%`]);

    if (rows.length === 0) {
      console.log('Aucune ressource trouvée.');
    } else {
      console.table(rows);
    }
  } catch (err) {
    console.error('Erreur lors de la recherche de la ressource :', err.message);
  }
}

async function handleResources() {
  let running = true;
  while (running) {
    showSubMenu('ressources');
    const choice = await askQuestion('Choisissez une option : ');

    switch (choice) {
      case '1':
        await createResource();
        break;
      case '2':
        await displayResources();
        break;
      case '3':
        await modifyResource();
        break;
      case '4':
        await deleteResource();
        break;
      case '5':
        await searchResource();
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
  handleResources,
};
