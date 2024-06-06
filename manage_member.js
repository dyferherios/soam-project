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

async function handleMembers() {
  let running = true;
  while (running) {
    showSubMenu("membres");
    const choice = await askQuestion("Choisissez une option : ");

    switch (choice) {
      case "1":
        await createAccount();
        break;
      case "2":
        await displayMembers();
        break;
      case "3":
        await modifyMember();
        break;
      case "4":
        await deleteMember();
        break;
      case "5":
        await searchMember();
        break;
      case "6":
        running = false;
        break;
      default:
        console.log("Choix invalide, veuillez réessayer.");
    }
  }
}

async function createAccount() {
  const m_ref = await askQuestion("Référence du membre (8 caractères) : ");
  const first_name = await askQuestion("Prénom : ");
  const last_name = await askQuestion("Nom : ");
  const adress = await askQuestion("Adresse : ");
  const email = await askQuestion("Email : ");
  const phone = await askQuestion("Téléphone : ");
  const member_type_id = await askQuestion("ID du type de membre : ");

  try {
    const result = await db.query(
      "INSERT INTO members (m_ref, first_name, last_name, adress, email, phone, member_type_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [m_ref, first_name, last_name, adress, email, phone, member_type_id]
    );
    console.log("Compte créé avec succès");
    console.table(result.rows);
  } catch (err) {
    if (err.code === "23505") {
      if (err.detail.includes("m_ref")) {
        console.error("Erreur : Cette référence est déjà utilisée.");
      }
    } else if (err.code === "23503") {
      console.error("Erreur : Le type de membre n'existe pas.");
    } else if (err.code === "23502") {
      console.error("Erreur : Un champ obligatoire est manquant.");
    } else if (err.code === "22001") {
      console.error("Erreur : La valeur saisie est trop longue.");
    } else {
      console.error("Erreur lors de la création du compte:", err.message);
    }
  }
}

async function displayMembers() {
  try {
    const { rows } = await db.query("SELECT * FROM members");
    console.log("Membres :");
    console.table(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des membres:", err.message);
  }
}

async function modifyMember() {
  const member_id = await askQuestion("ID du membre à modifier : ");

  try {
    const { rows } = await db.query(
      "SELECT * FROM members WHERE member_id = $1",
      [member_id]
    );
    if (rows.length === 0) {
      console.log("Aucun membre trouvé avec cet ID.");
      return;
    }

    const member = rows[0];
    const first_name =
      (await askQuestion(`Prénom (${member.first_name}) : `)) ||
      member.first_name;
    const last_name =
      (await askQuestion(`Nom (${member.last_name}) : `)) || member.last_name;
    const adress =
      (await askQuestion(`Adresse (${member.adress}) : `)) || member.adress;
    const email =
      (await askQuestion(`Email (${member.email}) : `)) || member.email;
    const phone =
      (await askQuestion(`Téléphone (${member.phone}) : `)) || member.phone;
    const member_type_id =
      (await askQuestion(
        `ID du type de membre (${member.member_type_id}) : `
      )) || member.member_type_id;

    await db.query(
      "UPDATE members SET first_name = $1, last_name = $2, adress = $3, email = $4, phone = $5, member_type_id = $6 WHERE member_id = $7",
      [first_name, last_name, adress, email, phone, member_type_id, member_id]
    );
    console.log("Membre modifié avec succès");
  } catch (err) {
    if (err.code === "23503") {
      console.error("Erreur : Le type de membre n'existe pas.");
    } else if (err.code === "22001") {
      console.error("Erreur : La valeur saisie est trop longue.");
    } else {
      console.error("Erreur lors de la modification du membre:", err.message);
    }
  }
}

async function deleteMember() {
  const member_id = await askQuestion("ID du membre à supprimer : ");

  try {
    const result = await db.query(
      "DELETE FROM members WHERE member_id = $1 RETURNING *",
      [member_id]
    );
    if (result.rowCount === 0) {
      console.log("Aucun membre trouvé avec cet ID.");
    } else {
      console.log("Membre supprimé avec succès");
    }
  } catch (err) {
    console.error("Erreur lors de la suppression du membre:", err.message);
  }
}

async function searchMember() {
  const searchTerm = await askQuestion("Entrez un terme de recherche : ");

  try {
    const { rows } = await db.query(
      `
          SELECT * FROM members 
          WHERE first_name ILIKE $1 
          OR last_name ILIKE $1 
          OR m_ref ILIKE $1 
          OR email ILIKE $1 
          OR CAST(member_id AS TEXT) ILIKE $1 
          OR CAST(member_type_id AS TEXT) ILIKE $1
        `,
      [`%${searchTerm}%`]
    );

    if (rows.length === 0) {
      console.log("Aucun membre trouvé.");
    } else {
      console.table(rows);
    }
  } catch (err) {
    console.error("Erreur lors de la recherche du membre:", err.message);
  }
}

module.exports = {handleMembers,};
