'use client';

import { useEffect, useState } from 'react';
import { Save, RefreshCw, MessageSquare } from 'lucide-react';

interface BotCommands {
  admin_stats: string;
  admin_users: string;
  admin_pending: string;
  admin_help: string;
  admin_approve: string;
  admin_reject: string;
  play: string;
  check_balance: string;
  deposit: string;
  withdraw: string;
  contact: string;
  instructions: string;
  transactions: string;
  winning_patterns: string;
  language: string;
}

interface BotMessages {
  welcome: string;
  share_contact: string;
  contact_received: string;
  balance_info: string;
  deposit_choose: string;
  deposit_cbe_info: string;
  deposit_telebirr_info: string;
  withdraw_info: string;
  contact_info: string;
  winning_patterns_info: string;
  how_to_play: string;
}

export default function SettingsPage() {
  const [adminChatId, setAdminChatId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'commands' | 'messages'>('commands');
  const [commands, setCommands] = useState<BotCommands>({
    admin_stats: '/admin_stats',
    admin_users: '/admin_users',
    admin_pending: '/admin_pending',
    admin_help: '/admin_help',
    admin_approve: '/approve_',
    admin_reject: '/reject_',
    play: '🎮 Play BINGO',
    check_balance: '💰 Check Balance',
    deposit: '💳 Deposit',
    withdraw: '💸 Withdraw',
    contact: '📞 Contact Us',
    instructions: '📜 Game Instruction',
    transactions: '📒 Transactions',
    winning_patterns: '🎯 Winning patterns',
    language: '🌐 Language',
  });
  const [messages, setMessages] = useState<BotMessages>({
    welcome: '🎰 Welcome to Nile Bingo!\n\nThe most exciting BINGO experience on Telegram.\n\nTap the button below to start playing!',
    share_contact: '📱 Please share your phone number to continue.\n\nThis helps us identify you and provide better support.',
    contact_received: '✅ Thank you! Your contact has been shared with our support team.',
    balance_info: '💰 *Your Balance*\n\nMain Wallet: 0 ETB\nPlay Wallet: 0 ETB\nTotal: 0 ETB',
    deposit_choose: '💳 *Choose payment method:*\n\nSelect your preferred option below:',
    deposit_cbe_info: '*CBE Deposit Instructions*\n\nAccount: 1000256789123\nName: Nile Bingo\nBank: CBE\n\nSend amount, then forward SMS confirmation here.',
    deposit_telebirr_info: '*Telebirr Deposit Instructions*\n\nNumber: 0925502345\nName: Ashe\n\nSend up to 1000 ETB, then forward SMS confirmation here.',
    withdraw_info: '*Withdraw Funds*\n\nContact support to withdraw. Min: 50 ETB',
    contact_info: '*Contact Support*\n\nEmail: support@nilebingo.com\nTelegram: @nile_bingo_support',
    winning_patterns_info: '*Winning Patterns*\n\n1. Horizontal Line\n2. Vertical Line\n3. Diagonal Line\n4. Four Corners\n5. Blackout\n\nFirst to complete a pattern wins!',
    how_to_play: '*How to Play BINGO:*\n\n1. Choose your stake (10/20/50 ETB)\n2. Select your card (1-300)\n3. Numbers are drawn\n4. Mark matching numbers\n5. Complete a row/column/diagonal to win!\n\nGood luck!',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/data?action=bot_config').then(r => r.json()),
      fetch('/api/admin/data?action=bot_messages').then(r => r.json()),
    ]).then(([config, msgs]) => {
      if (config && typeof config === 'object') {
        setCommands({
          admin_stats: config.admin_stats || '/admin_stats',
          admin_users: config.admin_users || '/admin_users',
          admin_pending: config.admin_pending || '/admin_pending',
          admin_help: config.admin_help || '/admin_help',
          admin_approve: config.admin_approve || '/approve_',
          admin_reject: config.admin_reject || '/reject_',
          play: config.play || '🎮 Play BINGO',
          check_balance: config.check_balance || '💰 Check Balance',
          deposit: config.deposit || '💳 Deposit',
          withdraw: config.withdraw || '💸 Withdraw',
          contact: config.contact || '📞 Contact Us',
          instructions: config.instructions || '📜 Game Instruction',
          transactions: config.transactions || '📒 Transactions',
          winning_patterns: config.winning_patterns || '🎯 Winning patterns',
          language: config.language || '🌐 Language',
        });
      }
      if (msgs && typeof msgs === 'object') {
        setMessages(prev => ({ ...prev, ...msgs }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSaveCommands = async () => {
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_bot_config', commands }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveMessages = async () => {
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_bot_messages', messages }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateCommand = (key: keyof BotCommands, value: string) => {
    setCommands(prev => ({ ...prev, [key]: value }));
  };

  const updateMessage = (key: keyof BotMessages, value: string) => {
    setMessages(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading settings...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-4">Settings</h1>

      <div className="glass rounded-xl p-4 max-w-2xl space-y-4">
        <div>
          <label className="text-xs text-gray-400 uppercase block mb-1">Admin Telegram Chat ID</label>
          <input
            type="text"
            value={adminChatId}
            onChange={(e) => setAdminChatId(e.target.value)}
            className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
            placeholder="Set in .env.local ADMIN_CHAT_ID"
            disabled
          />
          <p className="text-[10px] text-gray-500 mt-1">Configure in .env.local: ADMIN_CHAT_ID</p>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase block mb-1">Admin Password</label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
            placeholder="Set in .env.local ADMIN_PASSWORD"
            disabled
          />
          <p className="text-[10px] text-gray-500 mt-1">Configure in .env.local: ADMIN_PASSWORD</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('commands')}
            className={`px-4 py-2 text-xs font-medium transition-all ${activeTab === 'commands' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}
          >
            <RefreshCw size={12} className="inline mr-1" />
            Bot Commands
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 text-xs font-medium transition-all ${activeTab === 'messages' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}
          >
            <MessageSquare size={12} className="inline mr-1" />
            Bot Messages
          </button>
        </div>

        {/* Commands Tab */}
        {activeTab === 'commands' && (
          <div className="p-3 bg-navy rounded-xl">
            <h3 className="text-xs font-semibold text-white mb-3">Editable Bot Commands</h3>
            <p className="text-[9px] text-gray-500 mb-3">Change the command triggers. Changes apply within 30 seconds.</p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {Object.entries(commands).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-28 flex-shrink-0">{key}</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateCommand(key as keyof BotCommands, e.target.value)}
                    className="flex-1 bg-navy-light border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold/50"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSaveCommands} className="w-full mt-3 bg-gold text-navy font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2">
              <Save size={14} />
              {saved ? 'Saved!' : 'Save Commands'}
            </button>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="p-3 bg-navy rounded-xl">
            <h3 className="text-xs font-semibold text-white mb-3">Editable Bot Message Content</h3>
            <p className="text-[9px] text-gray-500 mb-3">Edit the text content of bot responses. Use \\n for new lines.</p>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {Object.entries(messages).map(([key, value]) => (
                <div key={key}>
                  <label className="text-[10px] text-gray-500 block mb-1">{key}</label>
                  <textarea
                    value={value}
                    onChange={(e) => updateMessage(key as keyof BotMessages, e.target.value)}
                    rows={3}
                    className="w-full bg-navy-light border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50 resize-y"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSaveMessages} className="w-full mt-3 bg-gold text-navy font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2">
              <Save size={14} />
              {saved ? 'Saved!' : 'Save Messages'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}