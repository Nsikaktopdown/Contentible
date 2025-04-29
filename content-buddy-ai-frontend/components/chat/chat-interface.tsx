'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Globe, MoreHorizontal, Bot, User, ArrowUp, Mic, Square, Calendar, Users, Target, Flag, BarChart, Newspaper, Loader2, Globe2, Music4, Camera, Menu, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { URLPreview } from '@/components/url-preview';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';

type MarketingCampaign = {
  campaign_name: string;
  campaign_objectives: string[];
  media_strategy: string[];
  performance_metrics: string[];
  target_audience: string;
  target_countries: string[];
  timeline: string;
};

type AdCopyResponse = {
  ad_copy_options: string[];
  localization_notes: string[];
  visual_description: string[];
};

type URLPreviewData = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  campaignData?: MarketingCampaign;
  adCopyData?: AdCopyResponse;
  isLoading?: boolean;
  urls?: URLPreviewData[];
};

type ApiResponse = {
  response: {
    action: string;
    response: MarketingCampaign | AdCopyResponse | string | string[];
  };
};

type ChatSession = {
  id: string;
  title: string;
  timestamp: Date;
};

const RichCampaignResponse = ({ data }: { data: MarketingCampaign }) => {
  return (
    <div className="space-y-6 text-sm">
      {/* Campaign Name */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800">{data.campaign_name}</h2>
        <div className="flex items-center gap-2 mt-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{data.timeline}</span>
        </div>
      </div>

      {/* Target Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Target Audience</h3>
          </div>
          <p className="text-gray-600">{data.target_audience}</p>
        </Card>
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Flag className="h-5 w-5 text-green-600" />
            <h3 className="font-medium">Target Countries</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {data.target_countries.map((country) => (
              <span key={country} className="px-2 py-1 bg-white rounded-full text-xs">
                {country}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Campaign Objectives */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-red-600" />
          <h3 className="font-medium">Campaign Objectives</h3>
        </div>
        <ul className="space-y-2">
          {data.campaign_objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="bg-white text-xs px-2 py-1 rounded-full">{index + 1}</span>
              <span className="text-gray-600">{objective}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Media Strategy */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="h-5 w-5 text-purple-600" />
          <h3 className="font-medium">Media Strategy</h3>
        </div>
        <ul className="space-y-2">
          {data.media_strategy.map((strategy, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="bg-white text-xs px-2 py-1 rounded-full">{index + 1}</span>
              <span className="text-gray-600">{strategy}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Performance Metrics */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <BarChart className="h-5 w-5 text-yellow-600" />
          <h3 className="font-medium">Performance Metrics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.performance_metrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-600" />
              <span className="text-gray-600">{metric}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const AdCopyResponse = ({ data }: { data: AdCopyResponse }) => {
  // Validate data structure
  if (!data || !data.ad_copy_options || !data.localization_notes || !data.visual_description) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-600">
        Error: Invalid response data structure
      </div>
    );
  }

  // Helper function to extract country code from emoji flag
  const getCountryFromAdCopy = (text: string): string => {
    const match = text.match(/^[a-z]{2}/i) || text.match(/^([A-Z]{2}):/);
    if (match) {
      return match[0].replace(/^/, '').replace(':', '');
    }
    return '';
  };

  // Helper function to group localization notes and visual descriptions
  const parseGroupedContent = (text: string) => {
    const [countries, content] = text.split(':').map(s => s.trim());
    return {
      countries: countries.split('/').map(c => c.trim()),
      content: content || ''
    };
  };

  return (
    <div className="space-y-6">
      {/* Ad Copy Options Section */}
      <Card className="overflow-hidden">
        <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
          <h3 className="font-medium text-gray-800">Ad Copy Options</h3>
        </div>
        <div className="p-4 space-y-4">
          {data.ad_copy_options.map((copy, index) => {
            const country = getCountryFromAdCopy(copy);
            const adCopyContent = copy.replace(/^[a-z]{2}:/i, '').trim();
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                {country && (
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600">
                      {country}
                    </span>
                  </div>
                )}
                <div className="prose prose-sm max-w-none text-gray-800">
                  <ReactMarkdown>{adCopyContent}</ReactMarkdown>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Localization Notes Section */}
      <Card className="overflow-hidden">
        <div className="border-b bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3">
          <h3 className="font-medium text-gray-800">Localization Notes</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.localization_notes.map((note, index) => {
            const { countries, content } = parseGroupedContent(note);
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  {countries.map(country => (
                    <span key={country} className="inline-flex items-center px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600">
                      {country}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600">{content}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Visual Description Section */}
      <Card className="overflow-hidden">
        <div className="border-b bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3">
          <h3 className="font-medium text-gray-800">Visual Descriptions</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.visual_description.map((desc, index) => {
            const { countries, content } = parseGroupedContent(desc);
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="h-4 w-4 text-gray-600" />
                  <div className="flex flex-wrap gap-1">
                    {countries.map(country => (
                      <span key={country} className="inline-flex items-center px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{content}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

async function fetchUrlMetadata(url: string): Promise<URLPreviewData> {
  try {
    // First try to fetch metadata using Microlink
    const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return {
        url,
        title: data.data.title || data.data.description || getDisplayUrl(url),
        description: data.data.description || '',
        image: data.data.image?.url || getPlaceholderImage(url),
        favicon: getFaviconUrl(url)
      };
    }

    // If Microlink fails, try to fetch the page directly
    const pageResponse = await fetch(url);
    const html = await pageResponse.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = 
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
      doc.querySelector('title')?.textContent ||
      getDisplayUrl(url);

    const description = 
      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
      '';

    const image = 
      doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
      getPlaceholderImage(url);

    return {
      url,
      title,
      description,
      image,
      favicon: getFaviconUrl(url)
    };
  } catch (error) {
    // Return basic metadata if both methods fail
    return {
      url,
      title: getDisplayUrl(url),
      description: 'Click to visit this resource',
      image: getPlaceholderImage(url),
      favicon: getFaviconUrl(url)
    };
  }
}

// Helper function to get a clean display URL
function getDisplayUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');
    const pathname = urlObj.pathname === '/' ? '' : urlObj.pathname;
    return `${hostname}${pathname}`;
  } catch {
    return url;
  }
}

// Helper function to get a placeholder image
function getPlaceholderImage(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return `https://via.placeholder.com/400x225/f3f4f6/64748b?text=${encodeURIComponent(hostname)}`;
  } catch {
    return `https://via.placeholder.com/400x225/f3f4f6/64748b?text=Preview`;
  }
}

// Helper function to get favicon URL
function getFaviconUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return '';
  }
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    { id: '1', title: 'Marketing Campaign Plan', timestamp: new Date() },
    { id: '2', title: 'Ad Copy Generation', timestamp: new Date() },
    { id: '3', title: 'Content Strategy Discussion', timestamp: new Date() },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getResponseMessage = (action: string, response: any): string => {
    switch (action) {
      case 'product_launch':
        return 'Here\'s your product launch campaign plan:';
      case 'generate_ad_copy':
      case 'ad_copy':
        return 'Here are the localized ad copy options:';
      case 'generate_trends':
        return 'Here are some relevant resources:';
      case 'general':
        return typeof response === 'string' ? response : 'Here\'s what I found:';
      default:
        return 'Here\'s what I found:';
    }
  };

  // Helper function to extract URLs and their metadata from text
  const extractUrls = (text: string): URLPreviewData[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex) || [];
    return matches.map(url => ({
      url,
      title: 'Website Preview', // In a real app, you'd fetch metadata from the URL
      description: 'Click to view the full content',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      urls: extractUrls(input),
    };
    setMessages((prev) => [...prev, userMessage]);

    const loadingMessage: Message = {
      role: 'assistant',
      content: '',
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8100/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data: ApiResponse = await response.json();
      
      let urls: URLPreviewData[] = [];
      if (data.response.action === 'generate_trends' && Array.isArray(data.response.response)) {
        urls = await Promise.all(
          data.response.response.map(async (url) => {
            try {
              const metadata = await fetchUrlMetadata(url);
              return metadata;
            } catch (error) {
              // If metadata fetching fails, return basic URL data
              return {
                url,
                title: new URL(url).hostname,
                description: 'Click to visit the resource'
              };
            }
          })
        );
      } else {
        urls = extractUrls(typeof data.response.response === 'string' ? data.response.response : '');
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: getResponseMessage(data.response.action, data.response.response),
        campaignData: data.response.action === 'product_launch' ? data.response.response as MarketingCampaign : undefined,
        adCopyData: (data.response.action === 'ad_copy' || data.response.action === 'generate_ad_copy') ? data.response.response as AdCopyResponse : undefined,
        urls: urls,
      };
      
      setMessages((prev) => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, assistantMessage];
      });
    } catch (error) {
      setMessages((prev) => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request. Please try again.',
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white relative">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Fixed Position */}
      <div className={cn(
        "fixed left-0 top-0 bottom-0 z-30 w-64 border-r bg-gray-50 flex flex-col transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* New Chat Button */}
        <div className="p-4 border-b">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              setMessages([]);
              setInput('');
            }}
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-2 py-4">
            {chatSessions.map((session) => (
              <Button
                key={session.id}
                variant="ghost"
                className="w-full justify-start gap-2 px-3 py-2 text-left text-sm font-normal"
              >
                <MessageSquare className="h-4 w-4" />
                <div className="flex-1 truncate">{session.title}</div>
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Collapse Button */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setSidebarOpen(false)}
          >
            <Menu className="h-4 w-4" />
            <span>Collapse sidebar</span>
          </Button>
        </div>
      </div>

      {/* Main Content - With Left Padding When Sidebar is Open */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        isSidebarOpen ? "md:pl-64" : "pl-0"
      )}>
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-lg"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-gray-800 font-semibold">Contentible</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-800">
            Temporary
          </Button>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 overflow-hidden relative">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <h1 className="text-4xl font-semibold text-gray-800 mb-8">What's on the agenda today?</h1>
              <div className="w-full max-w-2xl">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Ask anything"
                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 outline-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <div className="flex items-center gap-2 mt-4">
                    <Button type="button" variant="ghost" size="icon" className="rounded-lg">
                      <Plus className="h-5 w-5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="rounded-lg gap-2 text-gray-500">
                      <Globe className="h-4 w-4" />
                      Search
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="rounded-lg gap-2 text-gray-500">
                      Deep research
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="rounded-lg gap-2 text-gray-500">
                      Create image
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="rounded-lg ml-auto">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="rounded-lg">
                      <Mic className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="max-w-3xl mx-auto py-4 px-4 space-y-6 pb-24">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-4",
                      message.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar 
                      className={cn(
                        "h-8 w-8",
                        message.role === 'assistant' ? 'bg-teal-500' : 'bg-gray-400'
                      )}
                    >
                      {message.role === 'assistant' ? (
                        message.isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Avatar>
                    <div 
                      className={cn(
                        "px-4 py-2 rounded-2xl max-w-[80%]",
                        message.role === 'assistant' 
                          ? "bg-gray-100 rounded-tl-none" 
                          : "bg-white text-gray-800 rounded-tr-none border border-gray-200"
                      )}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Generating response...</span>
                        </div>
                      ) : (
                        <>
                          <div className="prose prose-sm max-w-none mb-2">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                          {message.urls && message.urls.length > 0 && (
                            <div className="space-y-2">
                              {message.urls.map((urlData, index) => (
                                <URLPreview
                                  key={index}
                                  metadata={urlData}
                                />
                              ))}
                            </div>
                          )}
                          {message.campaignData && (
                            <>
                              <RichCampaignResponse data={message.campaignData} />
                              <div className="flex flex-wrap gap-2 mt-4 -mb-4 -mx-4 px-4 py-3 bg-white border-t">
                                <Button
                                  variant="ghost"
                                  className="rounded-full bg-white hover:bg-gray-50 text-gray-600 border shadow-sm px-4 py-2 text-sm font-normal"
                                  onClick={() => {
                                    setInput("Create ad copy for this campaign");
                                    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                                  }}
                                >
                                  Create Ad-copy
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="rounded-full bg-white hover:bg-gray-50 text-gray-600 border shadow-sm px-4 py-2 text-sm font-normal"
                                  onClick={() => {
                                    setInput("Create video story board for this campaign");
                                    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                                  }}
                                >
                                  Create Video story board
                                </Button>
                              </div>
                            </>
                          )}
                          {message.adCopyData && (
                            <AdCopyResponse data={message.adCopyData} />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </main>

        {/* Fixed Input Area */}
        {messages.length > 0 && (
          <div className={cn(
            "fixed bottom-0 bg-white border-t transition-all duration-300 ease-in-out",
            isSidebarOpen ? "md:left-64 left-0 right-0" : "left-0 right-0"
          )}>
            <div className="max-w-3xl mx-auto p-4">
              <div className="relative">
                <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2 bg-gray-50 rounded-lg border shadow-sm">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message Contentible"
                    className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 min-h-[40px] max-h-[200px] resize-none overflow-auto"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    disabled={isLoading}
                    rows={1}
                    style={{
                      height: 'auto'
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full bg-black hover:bg-black/90 text-white h-10 w-10 flex-shrink-0"
                    disabled={!input.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowUp className="h-5 w-5" />
                    )}
                  </Button>
                </form>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Contentible AI Assistant - Your content creation partner
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 