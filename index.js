#!/usr/bin/env node
import fs from "fs";
import path from "path";
import inquirer from "inquirer";

// Read project name from CLI
let projectName = process.argv[2];

async function askQuestions() {
    if (!projectName) {
        const { pname } = await inquirer.prompt([
            {
                type: "input",
                name: "pname",
                message: "Enter your project name:"
            }
        ]);
        projectName = pname;
    }

    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "ai",
            message: "Do you need to integrate AI?",
            choices: ["None", "ChatGPT", "Meta AI", "Groq"]
        },
        {
            type: "list",
            name: "db",
            message: "Choose your database:",
            choices: ["None", "MongoDB", "MySQL", "PostgreSQL"]
        },
        {
            type: "confirm",
            name: "install",
            message: "Install npm dependencies?",
            default: false
        }
    ]);

    return answers;
}

function copyTemplate(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);

    const items = fs.readdirSync(src);
    for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyTemplate(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

(async () => {
    const answers = await askQuestions();

    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const templatePath = path.join(__dirname, "template");
    const projectPath = path.join(process.cwd(), projectName);

    // Copy basic template
    copyTemplate(templatePath, projectPath);

    // Add answer summary inside project
    const summary = `
AI Selected: ${answers.ai}
Database Selected: ${answers.db}
Install Dependencies: ${answers.install}
  `;

    fs.writeFileSync(path.join(projectPath, "config-result.txt"), summary);

    console.log(`Project "${projectName}" created successfully!`);

    if (answers.install) {
        console.log("Installing dependencies...");
        require("child_process").execSync("npm install", { cwd: projectPath, stdio: "inherit" });
    }
})();
