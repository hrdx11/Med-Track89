import React from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'interactive' | 'accent' | 'danger' | 'warning'
  className?: string
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'glass-card',
    interactive: 'glass-card glass-card-interactive cursor-pointer',
    accent: 'glass-card border-teal-500/30 bg-teal-500/5 dark:bg-teal-500/10',
    danger: 'glass-card border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10',
    warning: 'glass-card border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
  }

  return (
    <div
      className={`p-5 sm:p-6 transition-all duration-200 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
