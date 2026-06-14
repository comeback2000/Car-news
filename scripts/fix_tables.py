#!/usr/bin/env python3
"""Convert markdown pipe-tables inside <p> tags to proper HTML <table> elements.

Reads the BYD article HTML, detects blocks of pipe-delimited table rows
wrapped in <p>...</p>, and replaces them with semantic <table> markup.
"""

import re
import os

ARTICLE_PATH = os.path.join(os.path.dirname(__file__), '..', 'posts',
                            'byd-s-1-200-km-range-suv-is-coming-to-india.html')

def parse_pipe_row(line: str) -> list[str]:
    """Parse a pipe-delimited row into cells, trimming whitespace."""
    parts = [p.strip() for p in line.split('|')]
    # Remove leading/trailing empty cells from the outer pipes
    if parts and parts[0] == '':
        parts = parts[1:]
    if parts and parts[-1] == '':
        parts = parts[:-1]
    return parts

def is_separator_row(cells: list[str]) -> bool:
    """Check if a row is a separator (|---|)."""
    return all(all(ch in '- :' for ch in cell) for cell in cells)

def pipe_table_to_html(table_lines: list[str], table_start: int) -> str:
    """Convert pipe-table lines to HTML table markup."""
    rows = [parse_pipe_row(line) for line in table_lines]
    
    # Find separator row index
    sep_idx = -1
    for i, cells in enumerate(rows):
        if is_separator_row(cells):
            sep_idx = i
            break
    
    html = '<div class="table-wrapper"><table class="content-table">\n'
    
    if sep_idx >= 0 and sep_idx > 0:
        # Has header
        header_cells = rows[0]
        html += '  <thead><tr>\n'
        for cell in header_cells:
            html += f'    <th>{cell}</th>\n'
        html += '  </tr></thead>\n'
        data_rows = rows[sep_idx + 1:]
    else:
        data_rows = rows
    
    html += '  <tbody>\n'
    for row_cells in data_rows:
        if is_separator_row(row_cells):
            continue
        # First cell is th if separator was found (spec table pattern),
        # otherwise td
        html += '    <tr>\n'
        for i, cell in enumerate(row_cells):
            tag = 'th' if i == 0 and sep_idx >= 0 else 'td'
            html += f'      <{tag}>{cell}</{tag}>\n'
        html += '    </tr>\n'
    html += '  </tbody>\n'
    html += '</table></div>'
    
    return html


def fix_tables_in_file(filepath: str) -> int:
    """Find and replace pipe-tables in <p> tags. Returns count of tables fixed."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all <p> tags containing pipe-tables
    # Pattern: a block of consecutive <p>| ... |</p> lines
    table_pattern = re.compile(
        r'(?:<p>\|.*?\|</p>\s*)+',
        re.DOTALL
    )
    
    fixed_count = 0
    
    def replace_table(match):
        nonlocal fixed_count
        block = match.group(0)
        
        # Extract pipe lines from <p> tags
        lines = re.findall(r'<p>\|(.*?)\|</p>', block)
        if not lines:
            return block
        
        # Filter out empty results
        lines = [line.strip() for line in lines if line.strip()]
        if not lines:
            return block
        
        # Check if this actually looks like a table
        # At least one row must have 2+ pipes
        has_table_data = any(len(parse_pipe_row(line)) >= 2 for line in lines)
        if not has_table_data:
            return block
        
        fixed_count += 1
        return pipe_table_to_html(lines, 0) + '\n'
    
    new_content = table_pattern.sub(replace_table, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {fixed_count} table(s) in {filepath}")
    else:
        print(f"No tables found in {filepath}")
    
    return fixed_count


if __name__ == '__main__':
    result = fix_tables_in_file(ARTICLE_PATH)
    if result > 0:
        # Quick verification
        with open(ARTICLE_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
        table_count = content.count('<table')
        pipe_count = content.count('| ---')
        print(f"Verification: {table_count} HTML tables, {pipe_count} remaining separator rows")
        print("Done!")
    else:
        print("No tables were modified.")
