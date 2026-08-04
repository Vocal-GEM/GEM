import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # QuickActions has multiple className assignments for the main FAB
    bad_code = """                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/50 ${isOpen ? 'bg-slate-700 rotate-45' : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30'}`}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 ${isOpen ? 'bg-slate-700 rotate-45' : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30'}`}
                className={twMerge(
                    "w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50",
                    isOpen ? "bg-slate-700 rotate-45" : "bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30"
                )}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:ring-4 focus-visible:ring-teal-500/50 focus-visible:outline-none ${isOpen ? 'bg-slate-700 rotate-45' : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30'}`}"""

    good_code = """                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:ring-4 focus-visible:ring-teal-500/50 focus-visible:outline-none ${isOpen ? 'bg-slate-700 rotate-45' : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30'}`}"""

    content = content.replace(bad_code, good_code)

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_file("src/components/ui/QuickActions.jsx")
