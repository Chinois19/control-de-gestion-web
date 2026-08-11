with open('src/components/ClosedAttentionDashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "activeTab === 'rem20'" in line:
        print(f"Line {i+1}: {line.strip()}")
