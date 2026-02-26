from pathlib import Path

files = [p for p in Path('src').rglob('*') if p.is_file() and p.suffix in {'.ts', '.tsx'}]
touched = 0
for path in files:
    source = path.read_text(encoding='utf-8')
    updated = source.replace('React.JSX.Element', 'React.ReactNode')
    if updated != source:
        path.write_text(updated, encoding='utf-8')
        touched += 1

print(f'touched_files={touched}')
