"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ConversationsPage() {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const t = useTranslations("conversations");
  const tCommon = useTranslations("common");

  // Mock data for demonstration
  const mockConversations = [
    {
      id: "1",
      user: "John Doe",
      lastMessage: "Thank you for your help!",
      lastMessageTime: "2 minutes ago",
      status: "active" as const,
      unread: 2
    },
    {
      id: "2",
      user: "Jane Smith",
      lastMessage: "When is the best time to visit?",
      lastMessageTime: "1 hour ago",
      status: "active" as const,
      unread: 0
    },
    {
      id: "3",
      user: "Bob Johnson",
      lastMessage: "Got it, thanks!",
      lastMessageTime: "Yesterday",
      status: "resolved" as const,
      unread: 0
    }
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-lg">{tCommon("loading")}</div></div>;
  if (error) return <div className="flex items-center justify-center h-64"><div className="text-lg text-red-600">{error}</div></div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer conversations and messages
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-4">
          <input type="text" placeholder={tCommon("search")} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Resolved</option>
            <option>Archived</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {tCommon("filter")}
          </button>
        </div>
      </div>

      {/* Conversations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("allConversations")}
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
              {mockConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation === conversation.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                >
                  <div className="flex items-start">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                        {conversation.user.charAt(0)}
                      </div>
                      {conversation.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {conversation.user}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            conversation.status === "active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {conversation.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {conversation.lastMessageTime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation Detail */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {
                          mockConversations.find(
                            (c) => c.id === selectedConversation
                          )?.user.charAt(0)
                        }
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {
                            mockConversations.find(
                              (c) => c.id === selectedConversation
                            )?.user
                          }
                        </h3>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {t("online")}
                        </p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      {t("markResolved")}
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    {t("selectConversation")}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t("typeMessage")}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      {t("send")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg mb-2">💬</p>
                  <p>{t("selectConversation")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
