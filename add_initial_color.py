# Add initial background color to the orb
with open('src/components/viz/ResonanceOrb.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the orb div to add initial styling
old_orb = '''                <div
                    ref={orbRef}
                    className="w-32 h-32 rounded-full transition-all duration-150 z-10 relative"
                    style={{ transitionProperty: 'transform, opacity' }}
                ></div>'''

new_orb = '''                <div
                    ref={orbRef}
                    className="w-32 h-32 rounded-full transition-all duration-150 z-10 relative"
                    style={{ 
                        transitionProperty: 'transform, opacity',
                        backgroundColor: 'rgb(59, 130, 246)',
                        boxShadow: '0 0 60px rgb(59, 130, 246), 0 0 120px rgba(59, 130, 246, 0.25)'
                    }}
                ></div>'''

content = content.replace(old_orb, new_orb)

with open('src/components/viz/ResonanceOrb.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added initial background color to orb")
