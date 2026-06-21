import { NextRequest, NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
const hostUrl = process.env.HOST_URL || 'http://localhost:3002';
const miniAppUrl = hostUrl;
const adminChatId = process.env.ADMIN_CHAT_ID || '';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize bot lazily to avoid getMe timeout on module load
const bot = new Telegraf(botToken);

function getUserLang(ctx: any): 'en' | 'am' {
  return (ctx.from?.language_code === 'am' || ctx.from?.language_code === 'ar') ? 'am' : 'en';
}

const EN = {
  welcome: '🎰 Welcome to Fua BINGO!\n\nThe most exciting BINGO experience on Telegram.\n\nTap the button below to start playing!',
  share_contact: '📱 Please share your phone number to continue.\n\nThis helps us identify you and provide better support.',
  share_contact_btn: '📱 Share Phone Number',
  contact_received: '✅ Thank you! Your contact has been shared with our support team.',
  contact_already: '✅ Your phone number is already shared with us.',
  admin_notification: '📱 *New User Contact Shared*\n\n👤 User: {name}\n🆔 Telegram ID: {id}\n📞 Phone: {phone}\n👤 Username: @{username}',
  play: '🎮 Play BINGO',
  check_balance: '💰 Check Balance',
  deposit: '💳 Deposit',
  withdraw: '💸 Withdraw',
  contact: '📞 Contact Us',
  instructions: '📜 Game Instruction',
  transactions: '📒 Transactions',
  winning_patterns: '🎯 Winning patterns',
  language: '🌐 Language',
  balance_info: '💰 *Your Balance*\n\nMain Wallet: 0 ETB\nPlay Wallet: 0 ETB\nTotal: 0 ETB',
  no_account: 'Please click *Play BINGO* first to create your account.',
  how_to_play: [
    '*How to Play BINGO:*\n',
    '1\uFE0F\u20E3 Choose your stake amount (10/20/50 \u1241\u122D)\n',
    '2\uFE0F\u20E3 Select your BINGO card (1-300)\n',
    '3\uFE0F\u20E3 Numbers are drawn every few seconds\n',
    '4\uFE0F\u20E3 Mark matching numbers on your card\n',
    '5\uFE0F\u20E3 Complete a row, column, or diagonal to win!\n',
    'Good luck! \uD83C\uDF40'
  ].join(''),
  deposit_choose: '💳 *Choose payment method:*\n\nSelect your preferred payment option below:',
  deposit_cbe: 'CBE (Commercial Bank of Ethiopia)',
  deposit_telebirr: 'Telebirr',
  deposit_cbe_info: [
    '\uD83C\uDFE6 *Manual Deposit Instructions - CBE*\n',
    '*Bank Details:*\n',
    'Account Number: 1000256789123\n',
    'Account Name: Fua BINGO\n',
    'Bank: Commercial Bank of Ethiopia\n\n',
    '*Steps:*\n',
    '1\uFE0F\u20E3 Send the desired amount to the account above\n',
    '2\uFE0F\u20E3 Copy the full SMS confirmation from your bank\n',
    '3\uFE0F\u20E3 Send that confirmation message here\n\n',
    'Now send your transaction ID or payment confirmation text.\n',
    'Type *Cancel* any time to stop.'
  ].join(''),
  deposit_telebirr_info: [
    '\uD83D\uDCB3 *Manual Deposit Instructions - Telebirr*\n',
    '*Payment Details:*\n',
    'Number: 0925502345\n',
    'Recipient name: Ashe\n\n',
    '*Steps:*\n',
    '1\uFE0F\u20E3 Send up to 1000 ETB using Telebirr\n',
    '2\uFE0F\u20E3 Copy the full SMS confirmation from the wallet\n',
    '3\uFE0F\u20E3 Send that confirmation message here\n\n',
    'Now send your transaction ID or payment confirmation text.\n',
    'Type *Cancel* any time to stop.'
  ].join(''),
  withdraw_info: [
    '\uD83D\uDCB8 *Withdraw Funds*\n',
    'To withdraw your winnings, please contact our support team.\n',
    'Use the \uD83D\uDCDE Contact Us button to reach out.\n',
    'Minimum withdrawal: 50 ETB'
  ].join(''),
  contact_info: [
    '\uD83D\uDCDE *Contact Support*\n',
    'For any issues or inquiries:\n',
    'Email: support@fuabingo.com\n',
    'Telegram: @fua_bingo_support\n',
    'We typically respond within 24 hours.'
  ].join(''),
  winning_patterns_info: [
    '\uD83C\uDFAF *Winning Patterns*\n',
    'Complete any of these patterns to call BINGO!\n\n',
    '*1. Horizontal Line* \u2014 5 numbers in any row\n',
    '*2. Vertical Line* \u2014 5 numbers in any column\n',
    '*3. Diagonal Line* \u2014 5 numbers diagonally\n',
    '*4. Four Corners* \u2014 All 4 corner numbers\n',
    '*5. Blackout* \u2014 All 15 numbers on your card\n\n',
    'The first player to complete a valid pattern wins! \uD83C\uDFC6'
  ].join(''),
  language_menu: 'Choose your language / Select your language:',
  transactions_prompt: 'Open the Mini App and go to the Wallet tab to view your transaction history.',
};

const AM = {
  welcome: '\uD83C\uDFB0 Welcome to Fua BINGO! The most exciting BINGO experience on Telegram. Tap the button below to start playing!',
  share_contact: '📱 እባክዎ ለመቀጠል ስልክ ቁጥርዎን ያጋሩ።\n\nይህ እርስዎን ለመለየት እና የተሻለ ድጋፍ ለመስጠት ይረዳናል።',
  share_contact_btn: '📱 ስልክ ቁጥር አጋራ',
  contact_received: '✅ እናመሰግናለን! ስልክ ቁጥርዎ ለደንበኛ ድጋፍ ቡድናችን ደርሷል።',
  contact_already: '✅ ስልክ ቁጥርዎ ቀደም ሲል ተጋርቷል።',
  admin_notification: '📱 *አዲስ ተጠቃሚ ስልክ ቁጥር አጋርቷል*\n\n👤 ተጠቃሚ: {name}\n🆔 ቴሌግራም መለያ: {id}\n📞 ስልክ: {phone}\n👤 የተጠቃሚ ስም: @{username}',
  play: '\uD83C\uDFAE \u1261\u1295\u130C\u12CE \u1273\u132B\u12CB\u1275',
  check_balance: '\u12C0\u122D\u12EE \u1212\u1235\u1265 \u12ED\u1218\u120D\u12A8\u1271',
  deposit: '\u1273\u12C8\u121B\u1272',
  withdraw: '\u12A0\u12C9\u1273',
  contact: '\u12EB\u130D\u1295\u1275',
  instructions: '\u12F0\u130B\u12EB\u1273 \u1218\u121D\u122A\u12EB',
  transactions: '\u130D\u1265\u12ED\u1276\u1275',
  winning_patterns: '\u12E8\u121B\u1234\u1295\u1260\u134B\u12EB \u12B8\u12F0\u12ED\u12EB\u1275',
  language: '\u1269\u1295\u1270\u1295',
  balance_info: '*Your Balance*\n\nMain Wallet: 0 ETB\nPlay Wallet: 0 ETB\nTotal: 0 ETB',
  how_to_play: '*How to Play BINGO:*\n\n1. Choose your stake (10/20/50 ETB)\n2. Select your card (1-300)\n3. Numbers are drawn\n4. Mark matching numbers\n5. Complete a row/column/diagonal to win!\n\nGood luck!',
  deposit_choose: '*Choose payment method:*\n\nSelect your preferred option below:',
  deposit_cbe: 'CBE Bank',
  deposit_telebirr: 'Telebirr',
  deposit_cbe_info: '*CBE Deposit Instructions*\n\nAccount: 1000256789123\nName: Fua BINGO\nBank: CBE\n\nSend amount, then forward SMS confirmation here.\n\nType Cancel to stop.',
  deposit_telebirr_info: '*Telebirr Deposit Instructions*\n\nNumber: 0925502345\nName: Ashe\n\nSend up to 1000 ETB, then forward SMS confirmation here.\n\nType Cancel to stop.',
  withdraw_info: '*Withdraw Funds*\n\nContact support to withdraw. Min: 50 ETB',
  contact_info: '*Contact Support*\n\nEmail: support@fuabingo.com\nTelegram: @fua_bingo_support',
  winning_patterns_info: '*Winning Patterns*\n\n1. Horizontal Line\n2. Vertical Line\n3. Diagonal Line\n4. Four Corners\n5. Blackout\n\nFirst to complete a pattern wins!',
  language_menu: 'Choose language:',
  transactions_prompt: 'Open the Mini App Wallet tab to view transactions.',
};

function getText(lang: 'en' | 'am', key: string): string {
  const dict = lang === 'am' ? AM as any : EN as any;
  const fallback = EN as any;
  return dict[key] || fallback[key] || key;
}

function getMainKeyboard(lang: 'en' | 'am') {
  const bt = (k: string) => getText(lang, k);
  return Markup.keyboard([
    [bt('play')],
    [bt('check_balance'), bt('deposit')],
    [bt('withdraw'), bt('contact')],
    [bt('instructions'), bt('transactions')],
    [bt('winning_patterns'), bt('language')],
  ]).resize();
}

// Helper to get or create profile in Supabase
async function getOrCreateProfile(telegramId: string, firstName?: string, username?: string) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('telegram_id', telegramId)
    .maybeSingle();

  if (existing) return existing;

  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      telegram_id: telegramId,
      first_name: firstName || null,
      username: username || null,
      language: 'en',
      sound_on: true,
      verified: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  // Create wallet for new user
  await supabase.from('wallets').insert({
    user_id: (newProfile as any).id,
    main_balance: 0,
    play_balance: 0,
  });

  return newProfile;
}

// Notify admin about new contact
async function notifyAdmin(telegramId: string, phone: string, firstName?: string, username?: string) {
  if (!adminChatId) return;
  const name = firstName || 'Unknown';
  const user = username ? `@${username}` : 'N/A';
  const msg = `📱 *New User Contact Shared*\n\n👤 User: ${name}\n🆔 Telegram ID: ${telegramId}\n📞 Phone: ${phone}\n👤 Username: ${user}`;
  try {
    await bot.telegram.sendMessage(adminChatId, msg, { parse_mode: 'Markdown' as const });
  } catch (err) {
    console.error('Failed to notify admin:', err);
  }
}

bot.start(async (ctx) => {
  const lang = getUserLang(ctx);
  const telegramId = String(ctx.from.id);
  const firstName = ctx.from.first_name;
  const username = ctx.from.username;

  // Create/ensure profile exists
  await getOrCreateProfile(telegramId, firstName, username);

  // Check if user already shared their phone
  const { data: profile } = await supabase
    .from('profiles')
    .select('phone')
    .eq('telegram_id', telegramId)
    .maybeSingle();

  if (profile?.phone) {
    // Phone already shared - go straight to main menu
    await ctx.reply(
      getText(lang, 'welcome'),
      Markup.inlineKeyboard([
        Markup.button.webApp(getText(lang, 'play'), miniAppUrl),
      ])
    );
    await ctx.reply('Use the buttons below:', getMainKeyboard(lang));
  } else {
    // Ask user to share their phone number first
    await ctx.reply(
      getText(lang, 'share_contact'),
      Markup.keyboard([
        [Markup.button.contactRequest(getText(lang, 'share_contact_btn'))],
      ]).resize().oneTime()
    );
  }
});

// Handle contact sharing
bot.on('contact', async (ctx) => {
  const lang = getUserLang(ctx);
  const telegramId = String(ctx.from.id);
  const phone = ctx.message?.contact?.phone_number;
  const firstName = ctx.from.first_name;
  const username = ctx.from.username;

  if (!phone) {
    await ctx.reply('Could not read your phone number. Please try again.');
    return;
  }

  // Store phone in profile
  const { error } = await supabase
    .from('profiles')
    .update({ phone, first_name: firstName || null, username: username || null })
    .eq('telegram_id', telegramId);

  if (error) {
    console.error('Error saving phone:', error);
    await ctx.reply('Sorry, there was an error saving your contact. Please try again.');
    return;
  }

  // Confirm to user
  await ctx.reply(getText(lang, 'contact_received'));

  // Notify admin
  await notifyAdmin(telegramId, phone, firstName, username);

  // Show main menu
  await ctx.reply(
    getText(lang, 'welcome'),
    Markup.inlineKeyboard([
      Markup.button.webApp(getText(lang, 'play'), miniAppUrl),
    ])
  );
  await ctx.reply('Use the buttons below:', getMainKeyboard(lang));
});

bot.hears(/^🎮/, async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.reply(getText(lang, 'play'), Markup.inlineKeyboard([
    Markup.button.webApp(getText(lang, 'play'), miniAppUrl),
  ]));
});

bot.hears(/^💰/, async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.reply(getText(lang, 'balance_info'), { parse_mode: 'Markdown' as const });
});

bot.hears(/^💳/, async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.reply(getText(lang, 'deposit_choose'), {
    parse_mode: 'Markdown' as const,
    ...Markup.inlineKeyboard([
      [Markup.button.callback('\uD83C\uDFE6 ' + getText(lang, 'deposit_cbe'), 'deposit_cbe')],
      [Markup.button.callback('\uD83D\uDCF1 ' + getText(lang, 'deposit_telebirr'), 'deposit_telebirr')],
    ])
  });
});

bot.action('deposit_cbe', async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.editMessageText(getText(lang, 'deposit_cbe_info'), { parse_mode: 'Markdown' as const });
});

bot.action('deposit_telebirr', async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.editMessageText(getText(lang, 'deposit_telebirr_info'), { parse_mode: 'Markdown' as const });
});

bot.hears(/^💸/, async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.reply(getText(lang, 'withdraw_info'), { parse_mode: 'Markdown' as const });
});

bot.hears(/^📞/, async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.reply(getText(lang, 'contact_info'), { parse_mode: 'Markdown' as const });
});

bot.hears(/^📜/, async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.reply(getText(lang, 'how_to_play'), { parse_mode: 'Markdown' as const });
});

bot.hears(/^📒/, async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.reply(getText(lang, 'transactions_prompt'), {
    parse_mode: 'Markdown' as const,
    ...Markup.inlineKeyboard([
      Markup.button.webApp('\uD83D\uDCC2 Open Mini App', miniAppUrl),
    ])
  });
});

bot.hears(/^🎯/, async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.reply(getText(lang, 'winning_patterns_info'), { parse_mode: 'Markdown' as const });
});

bot.hears(/^🌐/, async (ctx) => {
  await ctx.reply(getText('en', 'language_menu'), {
    ...Markup.inlineKeyboard([
      [Markup.button.callback('\uD83C\uDDEC\uD83C\uDDE7 English', 'lang_en')],
      [Markup.button.callback('\uD83C\uDDEA\uD83C\uDDF9 Amharic', 'lang_am')],
    ])
  });
});

bot.action('lang_en', async (ctx) => {
  await ctx.editMessageText('Language set to English');
  await ctx.reply('Use the buttons below:', getMainKeyboard('en'));
});

bot.action('lang_am', async (ctx) => {
  await ctx.editMessageText('Language set to Amharic');
  await ctx.reply('Use the buttons below:', getMainKeyboard('am'));
});

bot.on('text', async (ctx) => {
  const lang = getUserLang(ctx);
  await ctx.reply('Use the buttons below:', getMainKeyboard(lang));
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    // Return 200 even on error so Telegram doesn't keep retrying
    return NextResponse.json({ ok: true, warning: 'handled with error' });
  }
}
