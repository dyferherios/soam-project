// app.js
const readline = require("readline");
const db = require("./db");
const manage_member = require('./manage_member');
const manage_activity = require('./manage_activity');
const manage_event = require('./manage_event');
const participations = require('./manage_participation');
const resources = require('./manage_ressources');
const finances = require('./manage_finances');



function showMainMenu() {
  console.log(`
  =======================================
  ╔══════════════════════════════════════╗
  ║                                      ║
  ║ ███████╗ ██████╗  █████╗ ███╗   ███╗ ║
  ║ ██╔════╝██╔═══██╗██╔══██╗████╗ ████║ ║
  ║ ███████╗██║   ██║███████║██╔████╔██║ ║
  ║ ╚════██║██║   ██║██╔══██║██║╚██╔╝██║ ║
  ║ ███████║╚██████╔╝██║  ██║██║ ╚═╝ ██║ ║
  ║ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝ ║              
  ║                                      ║
  ║     1. Gestion des membres           ║
  ║     2. Gestion des activités         ║
  ║     3. Gestion des événements        ║
  ║     4. Gestion des ressources        ║
  ║     5. Gestion des finances          ║
  ║     6. Gestion des participations    ║
  ║     7. Quitter                       ║
  ║                                      ║
  ╚══════════════════════════════════════╝
  =======================================
  `);
}

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

async function main() {
  let running = true;

  while (running) {
    showMainMenu();
    const choice = await askQuestion("Choisissez une option : ");

    switch (choice) {
      case "1":
        await manage_member.handleMembers();
        break;
      case "2":
        await manage_activity.handleActivities();
        break;
      case "3":
        await manage_event.handleEvents();
        break;
      case "4":
        await resources.handleResources();
        break;
      case "5":
        await finances.handleFinances();
        break;
      case "6":
        await participations.handleParticipations();
        break;
      case "7":
        running = false;
        console.log("Au revoir!");
        rl.close();
        db.end();
        break;
      default:
        console.log("Choix invalide, veuillez réessayer.");
    }
  }
}

main();

