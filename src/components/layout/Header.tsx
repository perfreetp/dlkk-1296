import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">简历优化助手</h2>
          <p className="text-sm text-gray-500 mt-0.5">打磨简历，提升求职竞争力</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">用户</p>
              <p className="text-gray-500">免费版</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
