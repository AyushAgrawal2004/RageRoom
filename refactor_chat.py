import re

with open('client/src/pages/Chat.jsx', 'r') as f:
    content = f.read()

# 1. Base layout
content = content.replace('bg-slate-200', 'bg-[#FAFAFA]')
content = content.replace('bg-slate-50/50', 'bg-[#FAFAFA]')
content = content.replace('bg-slate-50', 'bg-[#FAFAFA]')

# 2. Header
content = content.replace('bg-slate-800 text-white', 'bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-[#E5E7EB]')
content = content.replace('text-slate-300 hover:text-white', 'text-[#6B6B6B] hover:text-[#111111]')
content = content.replace('bg-slate-700', 'bg-[#F3F4F6]')

# 3. Accent color
content = content.replace('bg-blue-600', 'bg-[var(--color-accent)]')
content = content.replace('text-blue-600', 'text-[var(--color-accent)]')
content = content.replace('border-blue-500', 'border-[var(--color-accent)]')
content = content.replace('ring-blue-500', 'ring-[var(--color-accent)]')
content = content.replace('hover:bg-blue-700', 'hover:bg-[var(--color-accent-hover)]')
content = content.replace('bg-blue-50', 'bg-indigo-50/50')
content = content.replace('text-blue-700', 'text-indigo-700')
content = content.replace('bg-blue-100', 'bg-indigo-100')
content = content.replace('border-blue-200', 'border-indigo-200')

# 4. Text colors
content = content.replace('text-slate-800', 'text-[#111111]')
content = content.replace('text-slate-700', 'text-[#111111]')
content = content.replace('text-slate-600', 'text-[#6B6B6B]')
content = content.replace('text-slate-500', 'text-[#6B6B6B]')
content = content.replace('text-slate-400', 'text-[#9CA3AF]')
content = content.replace('text-slate-300', 'text-[#9CA3AF]')
content = content.replace('border-slate-300', 'border-[#E5E7EB]')
content = content.replace('border-slate-200', 'border-[#E5E7EB]')
content = content.replace('border-slate-100', 'border-[#F3F4F6]')

# 5. Rounded corners & Shadows
content = content.replace('rounded-xl', 'rounded-[16px]')
content = content.replace('rounded-2xl', 'rounded-[16px]')
content = content.replace('rounded-lg', 'rounded-[12px]')
content = content.replace('shadow-lg', 'shadow-[0_4px_24px_rgba(0,0,0,0.04)]')
content = content.replace('shadow-md', 'shadow-[0_2px_8px_rgba(0,0,0,0.04)]')

# 6. Typography
content = content.replace('font-bold', 'font-semibold')
content = content.replace('font-black', 'font-semibold')
content = content.replace('text-2xl', 'text-[24px] tracking-[-0.02em]')
content = content.replace('text-xl', 'text-[20px] tracking-[-0.01em]')
content = content.replace('text-lg', 'text-[16px]')

# 7. Chat Bubbles
content = content.replace("bg-[var(--color-accent)] text-white rounded-tr-sm", "bg-[var(--color-accent)] text-white rounded-tr-[4px]")
content = content.replace("bg-white border border-[#E5E7EB] text-[#111111] rounded-tl-sm", "bg-[#F3F4F6] text-[#111111] rounded-tl-[4px] border-none shadow-none")

with open('client/src/pages/Chat.jsx', 'w') as f:
    f.write(content)

print("Refactored!")
