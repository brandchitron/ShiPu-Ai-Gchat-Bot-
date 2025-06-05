const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
  );
  return base.data.romim;
};

(async () => {
  global.apis = {
    diptoApi: await baseApiUrl()
  };
})();

const config = {
  name: "tempmail",
  aliases: ["tmail", "tempemail", "mail"],
  version: "1.0.0",
  author: "Nyx",
  category: 'utility',
  role: 0,
  hasPermssion: 0,
  description: "Generate temporary emails or check inbox",
  usePrefix: true,
  commandCategory: "utility",
  cooldowns: 5,
  countDown: 5,
  guide: {
    en: "{pn} --gen [name] - Generate temporary email\n{pn} --inbox [email] - Check email inbox"
  }
};

const styles = {
  bold: (text) => `𝗧${text.slice(1)}`,
  italic: (text) => `𝘐${text.slice(1)}`,
  fancy: (text) => {
    const fancyChars = {
      'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱',
      'i': '𝓲', 'j': '𝓳', 'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹',
      'q': '𝓺', 'r': '𝓻', 's': '𝓼', 't': '𝓽', 'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁',
      'y': '𝔂', 'z': '𝔃', 'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕',
      'G': '𝓖', 'H': '𝓗', 'I': '𝓘', 'J': '𝓙', 'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝',
      'O': '𝓞', 'P': '𝓟', 'Q': '𝓠', 'R': '𝓡', 'S': '𝓢', 'T': '𝓣', 'U': '𝓤', 'V': '𝓥',
      'W': '𝓦', 'X': '𝓧', 'Y': '𝓨', 'Z': '𝓩'
    };
    return text.split('').map(char => fancyChars[char] || char).join('');
  },
  smallcaps: (text) => {
    const smallCaps = {
      'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ',
      'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ',
      'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x',
      'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toLowerCase().split('').map(char => smallCaps[char] || char).join('');
  }
};

async function onStart({ api, event, args }) {
  const command = args[0];
  
  if (command === '--gen') {
    try {
      const name = args[1] || "";
      const url = name
        ? `${global.apis.diptoApi}api/tempmail/Gen?name=${name}`
        : `${global.apis.diptoApi}api/tempmail/Gen?email=`;

      const response = await axios.get(url);
      const { email, token } = response.data;

      const gm = `
╭─────『 ${styles.fancy("TempMail Generator")} 』─────╮
│
│ ✅ ${styles.smallcaps("Email Generated Successfully")}
│
│ 📧 ${styles.bold("Email")}: ${email}
│ 🔑 ${styles.bold("Token")}: ${token}
│
│ 💡 ${styles.italic("Use")} "${global.config.PREFIX}tempmail --inbox ${email}" 
│    ${styles.italic("to check your inbox")}
│
╰───────────────────────────────────╯`;

      await api.sendMessage(gm, event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage(`❌ Error generating email: ${error.message}`, event.threadID, event.messageID);
    }
  }
  else if (command === '--inbox') {
    try {
      if (!args[1]) {
        return api.sendMessage("⚠️ Please provide an email address to check inbox.", event.threadID, event.messageID);
      }

      const email = encodeURIComponent(args[1]);
      const url = `${global.apis.diptoApi}api/tempmail/inbox?email=${email}`;
      const response = await axios.get(url);
      const emails = response.data;

      if (!Array.isArray(emails) || emails.length === 0 || !emails[0]) {
        return api.sendMessage(`📭 No emails found for ${decodeURIComponent(email)}`, event.threadID, event.messageID);
      }

      const latestEmail = emails[0];
      const {
        from = 'Unknown',
        to = 'Unknown',
        subject = '(No Subject)',
        body_text = '',
        created_at = new Date().toISOString()
      } = latestEmail;

      const cleanBodyText = body_text.replace(/\s+/g, ' ').trim();
      const linkRegex = /https?:\/\/[^\s)]+/g;
      const links = cleanBodyText.match(linkRegex) || [];

      const magicLinks = links.filter(link =>
        link.includes('magic-link') ||
        link.includes('authenticate') ||
        link.includes('verification')
      );

      const auth = magicLinks.length > 0 ? "✓ Yes" : "✗ No";

      const formattedMessage = `
╭─────『 📬 Inbox Results 』─────╮
│
│ 📧 To: ${to}
│ 👤 From: ${from}
│ 📅 Date: ${new Date(created_at).toLocaleString()}
│ 📝 Subject: ${subject}
│
├─────『 📄 Message 』─────┤
│ ${cleanBodyText.substring(0, 300)}${cleanBodyText.length > 300 ? '...' : ''}
│
${links.length > 0 ? `├─────『 🔗 Links Found 』─────┤\n│ ${links.join('\n│ ')}\n│\n` : ''}├─────『 🔐 Authentication 』─────┤
│ Authentication Links: ${auth}
│ Total Emails: ${emails.length}
│
╰───────────────────────────────────╯`;

      await api.sendMessage(formattedMessage, event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage(`❌ Error checking inbox: ${error.message}`, event.threadID, event.messageID);
    }
  }
  else {
    const helpMessage = `
╭─────『 📋 TempMail Help 』─────╮
│
│ ${global.config.PREFIX}tempmail --gen [name]
│ ┗━━➤ Generate a temporary email
│
│ ${global.config.PREFIX}tempmail --inbox [email]
│ ┗━━➤ Check email inbox
│
╰───────────────────────────────────╯`;

    api.sendMessage(helpMessage, event.threadID, event.messageID);
  }
}

module.exports = {
  config,
  onStart,
  run: onStart
};
