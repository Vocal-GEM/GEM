with open('src/components/viz/RegisterGauge.jsx', 'r') as f:
    c = f.read()

# Make sure showChestWarning is used. It looks like it wasn't used in the original JSX or I removed its usage?
# Actually, the original file had:
#     const showChestWarning = f0 > 300 && registerData.mechanism === 'M1';
#
# But then down below it had:
#     {f0 > 290 && (
#
# Wait, why was it a lint warning then?
# "warning  'showChestWarning' is assigned a value but never used  no-unused-vars"
# Let's check original file.
