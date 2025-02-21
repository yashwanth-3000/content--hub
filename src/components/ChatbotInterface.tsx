'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getCompanyChatbotWelcome, ragSearchCompany } from '@/lib/actions';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Loader2, 
  Bot, 
  User, 
  ArrowDown,
  MessageCircle,
  Sparkles,
  Clock,
  CheckCheck,
  RefreshCcw,
  XCircle,
  Info
} from 'lucide-react';

// Types
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotInterfaceProps {
  companyName: string;
  companyDescription?: string;
  className?: string;
}

interface MarkdownComponentProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  href?: string;
  src?: string;
  alt?: string;
}

// Custom styles for the markdown content
const markdownStyles = {
  p: "mb-4 last:mb-0 leading-relaxed",
  a: "text-blue-400 hover:text-blue-300 underline transition-colors duration-200",
  ul: "list-disc pl-6 mb-4 space-y-2",
  ol: "list-decimal pl-6 mb-4 space-y-2",
  li: "mb-1",
  h1: "text-2xl font-bold mb-4 mt-6 first:mt-0",
  h2: "text-xl font-bold mb-3 mt-5",
  h3: "text-lg font-bold mb-2 mt-4",
  h4: "text-base font-bold mb-2 mt-4",
  blockquote: "border-l-4 border-gray-600 pl-4 my-4 italic bg-gray-800/50 py-2 rounded",
  hr: "my-6 border-gray-600",
  table: "min-w-full divide-y divide-gray-700 my-4",
  th: "px-4 py-2 bg-gray-800 text-left text-sm font-semibold",
  td: "px-4 py-2 border-t border-gray-700 text-sm",
  img: "max-w-full h-auto rounded-lg my-4",
  pre: "my-4 rounded-lg overflow-hidden",
};

export function ChatbotInterface({ 
  companyName, 
  companyDescription,
  className = ''
}: ChatbotInterfaceProps) {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Custom components for ReactMarkdown
  const MarkdownComponents: Record<string, React.FC<any>> = {
    code({ node, inline, className, children, ...props }: MarkdownComponentProps) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline && match ? (
        <div className="relative group">
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => navigator.clipboard.writeText(String(children))}
              className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
            >
              Copy
            </button>
          </div>
          <SyntaxHighlighter
            style={coldarkDark}
            language={language}
            PreTag="div"
            className="!my-4 rounded-lg !bg-gray-900"
            showLineNumbers
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-700 rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    p: ({ children }) => <p className={markdownStyles.p}>{children}</p>,
    a: ({ href = '#', children }) => (
      <a href={href} className={markdownStyles.a} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className={markdownStyles.ul}>{children}</ul>,
    ol: ({ children }) => <ol className={markdownStyles.ol}>{children}</ol>,
    li: ({ children }) => <li className={markdownStyles.li}>{children}</li>,
    h1: ({ children }) => <h1 className={markdownStyles.h1}>{children}</h1>,
    h2: ({ children }) => <h2 className={markdownStyles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={markdownStyles.h3}>{children}</h3>,
    h4: ({ children }) => <h4 className={markdownStyles.h4}>{children}</h4>,
    blockquote: ({ children }) => <blockquote className={markdownStyles.blockquote}>{children}</blockquote>,
    hr: () => <hr className={markdownStyles.hr} />,
    table: ({ children }) => <table className={markdownStyles.table}>{children}</table>,
    th: ({ children }) => <th className={markdownStyles.th}>{children}</th>,
    td: ({ children }) => <td className={markdownStyles.td}>{children}</td>,
    img: ({ src = '', alt = '' }) => <img src={src} alt={alt} className={markdownStyles.img} />,
    pre: ({ children }) => <pre className={markdownStyles.pre}>{children}</pre>,
  };

  // Utility functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Effects
  useEffect(() => {
    const loadWelcomeMessage = async () => {
      try {
        setIsLoading(true);
        const result = await getCompanyChatbotWelcome({ companyName });
        
        if (result?.data?.generateChatbotWelcome) {
          setMessages([{ 
            id: crypto.randomUUID(),
            role: 'assistant',
            content: result.data.generateChatbotWelcome,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error fetching welcome message:', error);
        setMessages([{ 
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Hello! I'm your AI assistant for ${companyName}. How can I help you today?`,
          timestamp: new Date()
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWelcomeMessage();
  }, [companyName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  

  // Event handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);
    
    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    setIsLoading(true);
    try {
      const result = await ragSearchCompany({ 
        companyName, 
        query: userMessage 
      });

      if (result.errors?.length) {
        throw new Error(result.errors[0]?.message || 'Failed to get response');
      }

      const response = result.data?.vectorRagSearchCompany?.response || result.data?.vectorRagSearchCompany;
      
      if (response) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Error getting response:', error);
      setError('Failed to get response. Please try again.');
      setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border border-gray-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex-none p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-400 animate-pulse" />
            <span className="flex items-center gap-2">
              {companyName} Assistant
              <Sparkles className="w-4 h-4 text-yellow-400 animate-spin-slow" />
            </span>
          </h2>
          <div className="flex items-center gap-2 text-gray-400">
            {isLoading ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4 text-green-400" />
            )}
            <MessageCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } opacity-0 animate-fade-in-up`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'forwards' 
              }}
            >
              {message.role === 'assistant' && (
                <div className="flex-none">
                  <Bot className="w-6 h-6 text-blue-400 mt-2 mr-2" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-4 transform transition-all duration-300 hover:scale-[1.02] ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                }`}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                    className="markdown-content"
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <Clock className="w-3 h-3" />
                  <span className={
                    message.role === 'user' 
                      ? 'text-blue-200' 
                      : 'text-gray-400'
                  }>
                    {formatTimestamp(message.timestamp)}
                  </span>
                  <CheckCheck className="w-3 h-3" />
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex-none">
                  <User className="w-6 h-6 text-blue-400 mt-2 ml-2" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start items-start animate-fade-in">
              <div className="flex-none">
                <Bot className="w-6 h-6 text-blue-400 mt-2 mr-2" />
              </div>
              <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-800 animate-shake flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 group animate-bounce"
          >
            <ArrowDown className="w-4 h-4 group-hover:animate-bounce" />
          </button>
        )}
      </div>

      {/* Enhanced Input Form */}
      <div className="flex-none border-t border-gray-800 bg-gray-900">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-gray-800 text-white border-none rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-400"
                disabled={isLoading}
              />
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !inputMessage.trim()}
              className="flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}