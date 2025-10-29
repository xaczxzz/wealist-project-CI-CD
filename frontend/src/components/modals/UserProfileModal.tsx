import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UserProfile } from '../../types';

interface UserProfileModalProps {
  user: UserProfile;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  const { theme } = useTheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className={`relative ${theme.colors.card} ${theme.effects.borderWidth} ${theme.colors.border} p-6 ${theme.effects.borderRadius} shadow-xl`}>
          <div className={`flex items-center justify-between mb-6 pb-4 ${theme.effects.borderWidth} ${theme.colors.border} border-t-0 border-l-0 border-r-0`}>
            <h2 className={`${theme.font.size.base} font-bold`}>PLAYER INFO</h2>
            <button 
              onClick={onClose} 
              className={`bg-red-500 ${theme.effects.cardBorderWidth} ${theme.colors.border} p-2 hover:bg-red-600 ${theme.effects.borderRadius} transition`}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className={`w-24 h-24 ${theme.colors.primary} ${theme.effects.borderWidth} ${theme.colors.border} flex items-center justify-center text-white text-3xl font-bold ${theme.effects.borderRadius}`}>
                {user.name[0]}
              </div>
            </div>

            <div>
              <label className={`block ${theme.font.size.xs} mb-2 ${theme.colors.textSecondary}`}>NAME:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.card} ${theme.font.size.xs} ${theme.effects.borderRadius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block ${theme.font.size.xs} mb-2 ${theme.colors.textSecondary}`}>EMAIL:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.card} ${theme.font.size.xs} ${theme.effects.borderRadius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button className={`flex-1 ${theme.colors.primary} text-white py-3 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.primaryHover} transition ${theme.font.size.xs} ${theme.effects.borderRadius}`}>
                SAVE
              </button>
              <button 
                onClick={onClose} 
                className={`flex-1 bg-gray-300 py-3 ${theme.effects.cardBorderWidth} ${theme.colors.border} hover:bg-gray-400 transition ${theme.font.size.xs} ${theme.effects.borderRadius}`}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;