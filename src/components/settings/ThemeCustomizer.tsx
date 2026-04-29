import { useState, useEffect } from 'react';

interface Theme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: string;
  text: string;
  preview: string;
}

const themes: Theme[] = [
  {
    id: 'default',
    name: 'Orange Sunset',
    primary: '#1e293b',
    accent: '#f97316',
    background: '#ffffff',
    text: '#1e293b',
    preview: '🌅',
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    primary: '#1e3a8a',
    accent: '#3b82f6',
    background: '#ffffff',
    text: '#1e293b',
    preview: '🌊',
  },
  {
    id: 'green',
    name: 'Forest Green',
    primary: '#14532d',
    accent: '#22c55e',
    background: '#ffffff',
    text: '#1e293b',
    preview: '🌲',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    primary: '#581c87',
    accent: '#a855f7',
    background: '#ffffff',
    text: '#1e293b',
    preview: '👑',
  },
  {
    id: 'red',
    name: 'Ruby Red',
    primary: '#7f1d1d',
    accent: '#ef4444',
    background: '#ffffff',
    text: '#1e293b',
    preview: '💎',
  },
  {
    id: 'teal',
    name: 'Tropical Teal',
    primary: '#134e4a',
    accent: '#14b8a6',
    background: '#ffffff',
    text: '#1e293b',
    preview: '🏝️',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    primary: '#0f172a',
    accent: '#f97316',
    background: '#1e293b',
    text: '#f1f5f9',
    preview: '🌙',
  },
  {
    id: 'pink',
    name: 'Cherry Blossom',
    primary: '#831843',
    accent: '#ec4899',
    background: '#ffffff',
    text: '#1e293b',
    preview: '🌸',
  },
];

export default function ThemeCustomizer() {
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [touchMode, setTouchMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved) setSelectedTheme(saved);

    const touchSaved = localStorage.getItem('touch_mode');
    if (touchSaved) setTouchMode(touchSaved === 'true');
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-text', theme.text);

    // Update body background
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;

    setSelectedTheme(theme.id);
    localStorage.setItem('app_theme', theme.id);
    localStorage.setItem('theme_config', JSON.stringify(theme));
  };

  const toggleTouchMode = () => {
    const newMode = !touchMode;
    setTouchMode(newMode);
    localStorage.setItem('touch_mode', String(newMode));
    
    // Apply touch-friendly styles
    if (newMode) {
      document.body.classList.add('touch-mode');
    } else {
      document.body.classList.remove('touch-mode');
    }
    
    alert('Touch mode ' + (newMode ? 'enabled' : 'disabled') + '! Buttons will be larger.');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Theme Customizer</h3>

      {/* Touch Mode Toggle */}
      <div className="card bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold mb-1">Touch-Friendly Mode</h4>
            <p className="text-sm text-gray-600">
              Enable larger buttons and spacing for touchscreen devices
            </p>
          </div>
          <button
            onClick={toggleTouchMode}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              touchMode
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {touchMode ? '✓ Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="card">
        <h4 className="font-semibold mb-4">Color Themes</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => applyTheme(theme)}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedTheme === theme.id
                  ? 'border-accent shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
              }}
            >
              <div className="text-4xl mb-2">{theme.preview}</div>
              <div className="text-white font-semibold text-sm">{theme.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="card">
        <h4 className="font-semibold mb-4">Preview</h4>
        <div className="space-y-3">
          <button className="btn btn-primary w-full">Primary Button</button>
          <button className="btn btn-secondary w-full">Secondary Button</button>
          <div className="card bg-gray-50">
            <p className="text-sm">This is how cards will look with the selected theme.</p>
          </div>
        </div>
      </div>

      {/* Custom CSS Info */}
      <div className="card bg-yellow-50">
        <h4 className="font-semibold mb-2">💡 Theme Variables</h4>
        <p className="text-sm text-gray-600 mb-2">
          The following CSS variables are available for customization:
        </p>
        <ul className="text-xs font-mono space-y-1">
          <li>--color-primary: Primary color</li>
          <li>--color-accent: Accent color</li>
          <li>--color-background: Background color</li>
          <li>--color-text: Text color</li>
        </ul>
      </div>
    </div>
  );
}
