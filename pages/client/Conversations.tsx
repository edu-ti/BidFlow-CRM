import React, { useState } from 'react';
import { Search, Paperclip, Send, MoreVertical, Smile, Check, CheckCheck, Phone, Video, MessageSquare } from 'lucide-react';
import { Conversation, Message } from '../../types';

const mockConversations: Conversation[] = [
  { id: '1', contactId: 'c1', contactName: 'Ana Silva', lastMessage: 'Obrigada pelo orçamento!', unreadCount: 2, timestamp: '10:30', avatar: 'https://picsum.photos/seed/1/100' },
  { id: '2', contactId: 'c2', contactName: 'Carlos Oliveira', lastMessage: 'Pode me ligar amanhã?', unreadCount: 0, timestamp: 'Ontem', avatar: 'https://picsum.photos/seed/2/100' },
  { id: '3', contactId: 'c3', contactName: 'Marina Souza', lastMessage: 'Gostei da proposta.', unreadCount: 0, timestamp: 'Ontem', avatar: 'https://picsum.photos/seed/3/100' },
];

const mockMessages: Message[] = [
  { id: '1', content: 'Olá Ana, tudo bem? Vi seu interesse no nosso plano.', sender: 'me', timestamp: '10:00', status: 'read', type: 'text' },
  { id: '2', content: 'Oi! Tudo ótimo. Sim, gostaria de saber mais valores.', sender: 'contact', timestamp: '10:05', status: 'read', type: 'text' },
  { id: '3', content: 'Claro! Temos planos a partir de R$ 99,00.', sender: 'me', timestamp: '10:06', status: 'read', type: 'text' },
  { id: '4', content: 'Obrigada pelo orçamento!', sender: 'contact', timestamp: '10:30', status: 'read', type: 'text' },
];

const Conversations = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* List Panel */}
      <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar conversa..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
          {mockConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedChat(conv.id)}
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                selectedChat === conv.id
                  ? "bg-indigo-50 dark:bg-indigo-900/30"
                  : ""
              }`}
            >
              <img
                src={conv.avatar}
                alt={conv.contactName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {conv.contactName}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {conv.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-[#e5ddd5] dark:bg-[#0b141a] relative">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="bg-gray-100 dark:bg-gray-800 p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-center gap-3">
                <img
                  src={
                    mockConversations.find((c) => c.id === selectedChat)?.avatar
                  }
                  className="w-10 h-10 rounded-full"
                  alt=""
                />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {
                      mockConversations.find((c) => c.id === selectedChat)
                        ?.contactName
                    }
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Online agora
                  </p>
                </div>
              </div>
              <div className="flex gap-4 text-gray-600 dark:text-gray-300">
                <Search size={20} className="cursor-pointer" />
                <MoreVertical size={20} className="cursor-pointer" />
              </div>
            </div>

            {/* Messages Background */}
            <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-10 pointer-events-none"></div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-0">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-sm relative ${
                      msg.sender === "me"
                        ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-800 dark:text-white rounded-tr-none"
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-[10px] text-gray-500 dark:text-gray-300">
                        {msg.timestamp}
                      </span>
                      {msg.sender === "me" &&
                        (msg.status === "read" ? (
                          <CheckCheck
                            size={14}
                            className="text-blue-500 dark:text-blue-300"
                          />
                        ) : (
                          <Check size={14} className="text-gray-500" />
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="bg-gray-100 dark:bg-gray-800 p-3 flex items-center gap-3 z-10">
              <Smile
                size={24}
                className="text-gray-500 dark:text-gray-400 cursor-pointer"
              />
              <Paperclip
                size={24}
                className="text-gray-500 dark:text-gray-400 cursor-pointer"
              />
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Digite uma mensagem"
                className="flex-1 bg-white dark:bg-gray-700 py-2 px-4 rounded-lg focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition">
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-center p-10 bg-gray-50 dark:bg-gray-900">
            <div className="w-64 h-64 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <MessageSquare
                size={64}
                className="text-gray-400 dark:text-gray-600"
              />
            </div>
            <h2 className="text-2xl font-light text-gray-600 dark:text-gray-300">
              BidFlow Web
            </h2>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              Envie e receba mensagens sem precisar manter seu celular
              conectado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;