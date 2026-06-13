import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  FileUp,
  Search,
  Edit3,
  GitCompare,
  Send,
  Library,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: FileUp, label: '简历导入' },
  { to: '/match', icon: Search, label: '职位匹配' },
  { to: '/edit', icon: Edit3, label: '优化编辑' },
  { to: '/compare', icon: GitCompare, label: '版本对比' },
  { to: '/delivery', icon: Send, label: '投递记录' },
  { to: '/library', icon: Library, label: '素材库' },
  { to: '/settings', icon: Settings, label: '设置' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-600">简历优化助手</h1>
        <p className="text-xs text-gray-500 mt-1">快速打磨，精准投递</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-blue-50 group',
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-1">需要帮助？</h3>
          <p className="text-xs text-blue-100">查看使用教程和常见问题</p>
        </div>
      </div>
    </aside>
  );
}
