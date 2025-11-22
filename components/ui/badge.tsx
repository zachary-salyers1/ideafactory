import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300',
    success: 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50',
    warning: 'bg-amber-900/30 text-amber-400 border border-amber-800/50',
    danger: 'bg-red-900/30 text-red-400 border border-red-800/50',
    outline: 'border border-slate-700 text-slate-400',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
