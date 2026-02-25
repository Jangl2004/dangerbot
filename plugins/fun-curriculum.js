// Plugin by deadly
global.curriculumGame = global.curriculumGame || {}

const random = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// 📝 LISTE
const lavori = [
    { nome: "Web Developer", desc: "💻 Crea siti e applicazioni web" },
    { nome: "Data Scientist", desc: "📊 Analizza dati e crea insight" },
    { nome: "Graphic Designer", desc: "🎨 Disegna loghi e grafiche" },
    { nome: "Marketing Specialist", desc: "📈 Promuove brand e prodotti" },
    { nome: "Social Media Manager", desc: "📱 Gestisce profili e community" },
    { nome: "AI Engineer", desc: "🤖 Sviluppa algoritmi e AI" },
    { nome: "Game Designer", desc: "🎮 Crea giochi e mondi virtuali" }
]

const aziende = ["Google", "Meta", "Amazon", "Tesla", "OpenAI", "Microsoft", "Netflix", "Startup Innovativa SRL"]
const studi = ["Laurea in Informatica", "Laurea in Economia", "Diploma Tecnico Informatico", "Master in Marketing Digitale", "Laurea in Ingegneria"]
const skillsList = ["Problem Solving", "Team Leadership", "JavaScript", "Cybersecurity", "UI/UX Design", "AI & Automation", "Data Analysis"]

// Bottoni riutilizzabili
const jobButtons = (prefix) => [
    {
        buttonId: `${prefix}curriculum`,
        buttonText: { displayText: '🔄 Rigenera CV' },
        type: 1
    },
    {
        buttonId: `${prefix}cercalavoro`,
        buttonText: { displayText: '💼 Cerca Lavoro' },
        type: 1
    }
];

let handler = async (m, { conn, usedPrefix, command }) => {
    const chat = m.chat

    // Gestione comando CERCA LAVORO
    if (command === 'cercalavoro') {
        let reply = '💼 *OPPORTUNITÀ DISPONIBILI:*\n\n'
        let used = new Set()
        while (used.size < 5) {
            const job = random(lavori)
            if (!used.has(job.nome)) {
                used.add(job.nome)
                reply += `• *${job.nome}*\n_${job.desc}_\n\n`
            }
        }
        
        return await conn.sendMessage(chat, {
            text: reply,
            footer: 'Seleziona un\'opzione qui sotto',
            buttons: jobButtons(usedPrefix),
            headerType: 1
        }, { quoted: m })
    }

    // Gestione comando CURRICULUM (Generazione)
    const nome = await conn.getName(m.sender)
    const lavoro = random(lavori).nome
    const azienda = random(aziende)
    const studio = random(studi)
    const esperienza = randomNum(1, 15)
    const skills = Array.from({ length: 4 }, () => random(skillsList)).join(" • ")
    const email = nome.toLowerCase().replace(/[^a-z0-9]/g, '') + randomNum(10, 99) + "@gmail.com"
    const telefono = "+39 3" + randomNum(10000000, 99999999)

    const cvText = `📄 *CURRICULUM VITAE*

👤 *Candidato*: ${nome}
💼 *Ruolo*: ${lavoro}
🏢 *Ultima Azienda*: ${azienda}
📅 *Esperienza*: ${esperienza} anni

🎓 *Formazione*: ${studio}
🛠️ *Competenze*: ${skills}

📧 *Contatti*: ${email}
📱 *Telefono*: ${telefono}

> 𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓`

    await conn.sendMessage(chat, {
        text: cvText,
        footer: 'Cosa vuoi fare ora?',
        buttons: jobButtons(usedPrefix),
        headerType: 1
    }, { quoted: m })
}

// Handler per i bottoni (se cliccati)
handler.before = async (m, { conn, usedPrefix }) => {
    // Se il messaggio è un click di un bottone che contiene i nostri ID
    if (m.type === 'buttons_response_message' || m.type === 'template_button_reply_message') {
        const id = m.buttonId || m.selectedButtonId
        if (id === `${usedPrefix}curriculum` || id === `${usedPrefix}cercalavoro`) {
            // Non serve fare nulla qui perché il comando verrà triggerato 
            // nuovamente dal sistema principale del bot ricononscendo l'ID
        }
    }
}

handler.help = ['curriculum', 'cercalavoro']
handler.tags = ['fun']
handler.command = /^(curriculum|cercalavoro)$/i
handler.group = false

export default handler
