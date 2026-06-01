'use client';

import { useState } from 'react';
import { 
  Plus, Link2, ExternalLink, Github, 
  Instagram, Youtube, Twitter, Facebook,
  Globe, Music, MessageCircle, Trash2, GripVertical,
  Share2, Edit3, X, Check
} from 'lucide-react';
import { siteConfig } from '@/lib/constants';

interface BioLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  clicks: number;
  order: number;
}

interface BioTheme {
  background: string;
  text: string;
  accent: string;
}

const defaultLinks: BioLink[] = [
  { id: '1', title: 'Latest Video', url: siteConfig.links.youtube, icon: 'youtube', clicks: 0, order: 0 },
  { id: '2', title: 'Follow on Instagram', url: siteConfig.links.instagram, icon: 'instagram', clicks: 0, order: 1 },
];

const themes: Record<string, BioTheme> = {
  light: { background: '#ffffff', text: '#1f2937', accent: '#0d9488' },
  dark: { background: '#1f2937', text: '#ffffff', accent: '#0d9488' },
  gradient: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff', accent: '#f59e0b' },
  minimal: { background: '#fafafa', text: '#000000', accent: '#000000' },
};

export default function LinkInBioPage() {
  const [links, setLinks] = useState<BioLink[]>(defaultLinks);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [activeTheme, setActiveTheme] = useState('light');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Add link
  const addLink = () => {
    if (!newLink.title || !newLink.url) return;
    
    const link: BioLink = {
      id: Date.now().toString(),
      title: newLink.title,
      url: newLink.url,
      clicks: 0,
      order: links.length,
    };
    
    setLinks([...links, link]);
    setNewLink({ title: '', url: '' });
  };

  // Remove link
  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  // Get icon
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'github': return <Github className="w-5 h-5" />;
      default: return <Link2 className="w-5 h-5" />;
    }
  };

  // Copy public URL
  const copyPublicUrl = () => {
    const url = `${window.location.origin}/bio/${siteConfig.author.name.toLowerCase().replace(' ', '-')}`;
    navigator.clipboard.writeText(url);
  };

  const theme = themes[activeTheme];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Link in Bio</h1>
          <p className="text-gray-500 mt-1">Create your custom link page</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {showPreview ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={copyPublicUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Copy Public URL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-6">
          {/* Profile Setup */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{siteConfig.author.name[0]}</span>
                )}
              </div>
              <div>
                <p className="font-medium">{siteConfig.author.name}</p>
                <p className="text-sm text-gray-500">{siteConfig.author.bio}</p>
              </div>
            </div>
          </div>

          {/* Link Management */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Links</h2>
            
            {/* Existing Links */}
            <div className="space-y-2 mb-4">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                  {getIcon(link.icon)}
                  <span className="flex-1 font-medium">{link.title}</span>
                  <span className="text-xs text-gray-400">{link.clicks} clicks</span>
                  <button className="p-1 text-gray-400 hover:text-blue-600">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeLink(link.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Link */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Title"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <input
                type="url"
                placeholder="URL"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={addLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Theme</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(themes).map(([name, t]) => (
                <button
                  key={name}
                  onClick={() => setActiveTheme(name)}
                  className={`p-4 rounded-lg border-2 ${
                    activeTheme === name ? 'border-blue-500' : 'border-transparent'
                  }`}
                  style={{ 
                    background: typeof t.background === 'string' && t.background.startsWith('linear') 
                      ? t.background 
                      : t.background,
                  }}
                >
                  <p className={`text-sm font-medium ${name === 'dark' || name === 'gradient' ? 'text-white' : ''}`}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <div className="w-4 h-4 rounded-full" style={{ background: t.accent }} />
                    <div className="w-4 h-4 rounded-full" style={{ background: t.text }} />
                  </div>
                  {activeTheme === name && (
                    <Check className="w-4 h-4 mt-2 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-100 rounded-xl p-8">
          <div className="max-w-sm mx-auto">
            {/* Phone Frame */}
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-8 border-gray-800">
              {/* Status Bar */}
              <div className="h-6 bg-gray-800 flex items-center justify-center">
                <div className="w-16 h-4 bg-black rounded-full" />
              </div>

              {/* Content */}
              <div 
                className="p-6 min-h-[500px] flex flex-col"
                style={{ 
                  background: typeof theme.background === 'string' && theme.background.startsWith('linear')
                    ? ''
                    : theme.background,
                  backgroundImage: theme.background.startsWith('linear')
                    ? theme.background
                    : 'none',
                }}
              >
                {/* Profile */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
                    <span className="text-xl" style={{ color: theme.text }}>
                      {siteConfig.author.name[0]}
                    </span>
                  </div>
                  <h2 className="font-bold text-lg mt-3" style={{ color: theme.text }}>
                    {siteConfig.author.name}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: theme.text, opacity: 0.7 }}>
                    {siteConfig.author.bio}
                  </p>
                </div>

                {/* Links */}
                <div className="space-y-3 flex-1">
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center py-3 px-4 rounded-lg font-medium transition-all hover:scale-105"
                      style={{ 
                        backgroundColor: theme.accent,
                        color: '#ffffff',
                      }}
                    >
                      {link.title}
                    </a>
                  ))}
                </div>

                {/* Social Icons */}
                <div className="flex justify-center gap-4 mt-6" style={{ color: theme.text }}>
                  <a href={siteConfig.links.youtube}><Youtube className="w-5 h-5" /></a>
                  <a href={siteConfig.links.instagram}><Instagram className="w-5 h-5" /></a>
                  <a href={siteConfig.links.github}><Github className="w-5 h-5" /></a>
                </div>
              </div>

              {/* Home Button */}
              <div className="h-8 bg-gray-800 flex items-center justify-center">
                <div className="w-16 h-1 bg-gray-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}