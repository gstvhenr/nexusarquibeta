from pathlib import Path
import re

ROOT = Path('src')

PATTERN_ARROW_BREAK = re.compile(r'=\)\s*=>\s*React\.JSX\.Element\s*')
PATTERN_OBJECT_END = re.compile(r'\}>\s*=')


def repair_file(path: Path) -> int:
    original = path.read_text(encoding='utf-8')
    updated = original

    updated = PATTERN_ARROW_BREAK.sub('=> ', updated)
    updated = PATTERN_OBJECT_END.sub('}) => React.JSX.Element =', updated)

    if updated != original:
        path.write_text(updated, encoding='utf-8')
        return 1
    return 0


def main() -> None:
    files = [p for p in ROOT.rglob('*') if p.is_file() and p.suffix in {'.ts', '.tsx'}]
    touched = sum(repair_file(p) for p in files)
    print(f'touched_files={touched}')


if __name__ == '__main__':
    main()
