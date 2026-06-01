'use client';

import { useState } from 'react';
import { 
  Search, TrendingUp, Tag, AlertTriangle, 
  CheckCircle, Lightbulb, ExternalLink, Copy
} from 'lucide-react';

interface KeywordSuggestion {
  keyword: string;
  searchVolume: string;
  competition: 'low' | 'medium' | 'high';
  trend: '↑' | '↓' | '→';
}

interface TitleAnalysis {
  score: number;
  length: number;
  hasNumbers: boolean;
  hasPowerWords: boolean;
  suggestions: string[];
}

interface TagAnalysis {
  tag: string;
  length: number;
  relevant: boolean;
}

export default function SeoToolsPage() {
  const [activeTab, setActiveTab] = useState<'keywords' | 'title' | 'tags'>('keywords');
  
  // Keyword Research State
  const [keywordInput, setKeywordInput] = useState('');
  const [targetVideo, setTargetVideo] = useState('latest');
  const [suggestedKeywords, setSuggestedKeywords] = useState<KeywordSuggestion[]>([
    { keyword: 'productivity tips', searchVolume: '10K-50K', competition: 'medium', trend: '↑' },
    { keyword: 'morning routine', searchVolume: '50K-100K', competition: 'high', trend: '↑' },
    { keyword: 'work from home', searchVolume: '100K+', competition: 'high', trend: '→' },
    { keyword: 'healthy sleep habits', searchVolume: '5K-10K', competition: 'low', trend: '↑' },
  ]);

  // Title Analysis State
  const [titleInput, setTitleInput] = useState('');
  const [titleAnalysis, setTitleAnalysis] = useState<TitleAnalysis | null>(null);

  // Tags State
  const [tagsInput, setTagsInput] = useState('');
  const [tagAnalysis, setTagAnalysis] = useState<TagAnalysis[]>([]);

  // Analyze title
  const analyzeTitle = () => {
    const length = titleInput.length;
    const hasNumbers = /\d+/.test(titleInput);
    const hasPowerWords = /best|top|ultimate|guide |tips|secrets|proven|amazing|free/i.test(titleInput);
    
    const suggestions: string[] = [];
    if (length < 50) suggestions.push('Add more descriptive words (50-60 chars ideal)');
    if (length > 100) suggestions.push('Title may be too long for full visibility');
    if (!hasNumbers) suggestions.push('Consider adding a number (e.g., "5 Tips")');
    if (!hasPowerWords) suggestions.push('Add power words like "Ultimate", "Essential", "Best"');
    
    const score = Math.min(100, 
      (hasNumbers ? 20 : 0) + 
      (hasPowerWords ? 20 : 0) + 
      (length >= 40 && length <= 70 ? 30 : 0) +
      (suggestions.length <= 2 ? 30 : 10)
    );

    setTitleAnalysis({ score, length, hasNumbers, hasPowerWords, suggestions });
  };

  // Analyze tags
  const analyzeTags = () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    setTagAnalysis(tags.map(tag => ({
      tag,
      length: tag.length,
      relevant: tag.length >= 2 && tag.length <= 30,
    })));
  };

  // Analyze on change
  const handleTitleChange = (value: string) => {
    setTitleInput(value);
    if (value.length > 10) {
      const length = value.length;
      const hasNumbers = /\d+/.test(value);
      const hasPowerWords = /best|top|ultimate|guide |tips|secrets|proven|amazing|free/i.test(value);
      const suggestions: string[] = [];
      if (length < 50) suggestions.push('Consider a longer title');
      if (!hasNumbers) suggestions.push('Add a number for CTR');
      
      const score = Math.min(100, 
        (hasNumbers ? 20 : 0) + 
        (hasPowerWords ? 20 : 0) + 
        (length >= 40 && length <= 70 ? 30 : 0)
      );

      setTitleAnalysis({ score, length, hasNumbers, hasPowerWords, suggestions });
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO Tools</h1>
        <p className="text-gray-500 mt-1">Optimize your YouTube content for discovery</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'keywords', label: 'Keyword Research', icon: Search },
          { id: 'title', label: 'Title Analyzer', icon: Lightbulb },
          { id: 'tags', label: 'Tag Manager', icon: Tag },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Keyword Research */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Keyword Research
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Seed Keyword</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Enter a seed keyword..."
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Search
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">For Video</label>
                <select 
                  value={targetVideo}
                  onChange={(e) => setTargetVideo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="latest">Latest Video</option>
                  <option value="upcoming">Upcoming Video</option>
                  <option value="all">All Videos</option>
                </select>
              </div>

              {/* Keyword List */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Keyword</th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Volume</th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Competition</th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Trend</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestedKeywords.map((kw, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-2">{kw.keyword}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{kw.searchVolume}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            kw.competition === 'low' ? 'bg-green-100 text-green-700' :
                            kw.competition === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {kw.competition}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-lg">{kw.trend}</td>
                        <td className="px-4 py-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <Copy className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* YouTube SEO Tips */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              SEO Best Practices
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Title Tips
                </h3>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>• Use 50-60 characters for full visibility</li>
                  <li>• Put most important words first</li>
                  <li>• Include numbers for better CTR</li>
                  <li>• Use power words (Ultimate, Best Guide)</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tag Tips
                </h3>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Include 15-20 relevant tags</li>
                  <li>• Mix broad and specific tags</li>
                  <li>• Add variations (singular/plural)</li>
                  <li>• Include competitor channels</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-yellow-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Common Mistakes
                </h3>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• Don't overstuff tags/keywords</li>
                  <li>• Don't clickbait - hurts retention</li>
                  <li>• Don't use unrelated popular tags</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title Analyzer Tab */}
      {activeTab === 'title' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Title Analyzer</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Enter Your Title</label>
              <textarea
                value={titleInput}
                onChange={(e) => handleTitleChange(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 10 Tips for Better Sleep Tonight"
              />
            </div>

            <button
              onClick={analyzeTitle}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Analyze Title
            </button>

            {/* Analysis Results */}
            {titleAnalysis && (
              <div className="mt-6 space-y-4">
                {/* Score */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${
                    titleAnalysis.score >= 80 ? 'border-green-500' :
                    titleAnalysis.score >= 60 ? 'border-yellow-500' :
                    'border-red-500'
                  }`}>
                    <span className="text-2xl font-bold">{titleAnalysis.score}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">SEO Score</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold">{titleAnalysis.length}</p>
                    <p className="text-xs text-gray-500">Characters</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold">{titleAnalysis.hasNumbers ? '✅' : '❌'}</p>
                    <p className="text-xs text-gray-500">Has Numbers</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold">{titleAnalysis.hasPowerWords ? '✅' : '❌'}</p>
                    <p className="text-xs text-gray-500">Power Words</p>
                  </div>
                </div>

                {/* Suggestions */}
                {titleAnalysis.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Suggestions</h3>
                    {titleAnalysis.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Title Templates</h2>

            <div className="space-y-2">
              {[
                '✅ [Number] [Benefit] You Need to Know',
                '✅ The Ultimate Guide to [Topic] in [Year]',
                '✅ [Number] Ways to [Achieve Goal]',
                '✅ [Controversial Statement] - Here\'s Why',
                '✅ I Tried [X] for [Time] - Results',
              ].map((template, i) => (
                <button
                  key={i}
                  onClick={() => setTitleInput(template.replace('✅ ', ''))}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <code className="text-sm">{template}</code>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tags Tab */}
      {activeTab === 'tags' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Tag Manager</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Your Tags (comma-separated)</label>
              <textarea
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="productivity, tips, morning routine, work from home"
              />
            </div>

            <button
              onClick={analyzeTags}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Analyze Tags
            </button>

            {tagAnalysis.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  {tagAnalysis.length} tags | {tagAnalysis.reduce((a, t) => a + t.tag.length + 1, 0)} chars used
                </p>
                <div className="flex flex-wrap gap-2">
                  {tagAnalysis.map((tag, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 text-sm rounded-full ${
                        tag.relevant ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tag.tag}
                      <button 
                        onClick={() => {
                          const newTags = tagsInput.split(',').filter((_, idx) => idx !== i);
                          setTagsInput(newTags.join(', '));
                        }}
                        className="ml-1 text-xs"
                      >×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Tag Suggestions</h2>

            <div className="space-y-3">
              {[
                'productivity tips 2024',
                'work from home tips',
                'morning routine productivity',
                'time management',
                'remote work guide',
              ].map((tag, i) => (
                <button
                  key={i}
                  onClick={() => setTagsInput(tagsInput ? `${tagsInput}, ${tag}` : tag)}
                  className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
                >
                  <span>{tag}</span>
                  <span className="text-xs text-gray-400">Add</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}