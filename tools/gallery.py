"""Build the gallery from sites/: cards, thumbnails, motion previews, the wall image,
the README grid, wall.md, prev/next links on every teardown, and gallery.data.js for gallery.html.

usage: python tools/gallery.py
"""
import glob
import json
import os
import re

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROUPS = {
    'house': 'House standard',
    'worlds': 'Worlds',
    'type': 'Type foundries and editorial',
    'writing': 'Writing and personal sites',
    'objects': 'Products, radio and genre pieces',
    'tables': 'Restaurants',
}
GROUP_NOTES = {
    'house': 'The page that passed review. Everything else is measured against it.',
    'worlds': 'Real-time 3D. Look at what each one spends its WebGL on.',
    'type': 'Foundries and publishers: the best typesetting on the web lives here.',
    'writing': 'Personal sites where the person is the subject.',
    'objects': 'Products and brands whose sites behave like the thing they sell.',
    'tables': 'Restaurant sites, for the studio.',
}


def p(*parts):
    return os.path.join(ROOT, *parts)


def load_sites():
    sites = []
    with open(p('tools', 'sites.tsv'), encoding='utf-8') as f:
        for line in f:
            if line.startswith('#') or not line.strip():
                continue
            group, slug, url = line.rstrip('\n').split('\t')[:3]
            meta_file = p('sites', slug, 'meta.json')
            if not os.path.exists(meta_file):
                continue
            with open(meta_file, encoding='utf-8') as m:
                meta = json.load(m)
            meta.update(group=group, slug=slug, url=meta.get('url', url))
            meta.setdefault('name', slug)
            meta.setdefault('idea', '')
            sites.append(meta)
    return sites


def shots(slug):
    files = [os.path.basename(f) for f in glob.glob(p('sites', slug, '*.jpg'))]
    files = [f for f in files if f != 'card.jpg']
    main = sorted(f for f in files if re.match(r'^\d\d-', f))
    extra = sorted(f for f in files if f.startswith('x-'))
    phone = [f for f in files if f == 'phone.jpg']
    return main + extra + phone


def fit(img, w, h):
    """Cover-crop to w x h from the top, the way a browser shows the first screen."""
    iw, ih = img.size
    scale = max(w / iw, h / ih)
    img = img.resize((round(iw * scale), round(ih * scale)), Image.LANCZOS)
    left = (img.width - w) // 2
    return img.crop((left, 0, left + w, h))


def build_images(site):
    slug = site['slug']
    d = p('sites', slug)
    files = shots(slug)
    site['shots'] = files
    if not files:
        return
    hero = Image.open(os.path.join(d, files[0])).convert('RGB')
    fit(hero, 960, 600).save(os.path.join(d, 'card.jpg'), quality=82, optimize=True)

    os.makedirs(os.path.join(d, 't'), exist_ok=True)
    for f in files:
        im = Image.open(os.path.join(d, f)).convert('RGB')
        w = 240 if f == 'phone.jpg' else 480
        im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(os.path.join(d, 't', f), quality=78, optimize=True)

    frames = sorted(glob.glob(p('.frames', slug, 'f*.jpg')))
    if len(frames) > 3:
        ims = [fit(Image.open(f).convert('RGB'), 720, 450) for f in frames]
        ims[0].save(os.path.join(d, 'motion.webp'), save_all=True, append_images=ims[1:], duration=130, loop=0, quality=62, method=4)
    site['motion'] = os.path.exists(os.path.join(d, 'motion.webp'))


def build_wall(sites):
    cols, w, h = 6, 400, 250
    cards = [s for s in sites if s.get('shots')]
    rows = (len(cards) + cols - 1) // cols
    wall = Image.new('RGB', (cols * w, rows * h), (12, 12, 12))
    for i, s in enumerate(cards):
        im = Image.open(p('sites', s['slug'], 'card.jpg')).resize((w, h), Image.LANCZOS)
        wall.paste(im, ((i % cols) * w, (i // cols) * h))
    os.makedirs(p('media'), exist_ok=True)
    wall.save(p('media', 'wall.jpg'), quality=80, optimize=True)


def anchor(title):
    return re.sub(r'[^a-z0-9 -]', '', title.lower()).replace(' ', '-')


def readme_block(sites):
    out = ['<!-- gallery:start -->', '']
    out.append(f'**{len(sites)} sites, {sum(len(s.get("shots", [])) for s in sites)} screenshots.** '
               'Click any card for the teardown: every screenshot, a motion preview, the stack, what to steal and what not to.')
    out.append('')
    out.append('Jump to:')
    out.append('')
    for g, title in GROUPS.items():
        n = sum(1 for s in sites if s['group'] == g)
        if n:
            out.append(f'- [{title}](#{anchor(title)}) ({n})')
    out.append('- [Every screen on one page](wall.md)')
    out.append('- [Our own Hydra](hydra.md) and the kit, [stage](https://github.com/clotheshoesandwoes/stage)')
    out.append('- [Brief template](briefs/template.md)')
    out.append('- Offline: open `gallery.html` from this folder (arrow keys flip through everything)')
    out.append('')
    for g, title in GROUPS.items():
        group = [s for s in sites if s['group'] == g and s.get('shots')]
        if not group:
            continue
        out.append(f'## {title}')
        out.append('')
        out.append(GROUP_NOTES[g])
        out.append('')
        out.append('<table>')
        for i in range(0, len(group), 3):
            out.append('<tr>')
            for s in group[i:i + 3]:
                link = f'sites/{s["slug"]}/teardown.md'
                out.append(f'<td width="33%" valign="top"><a href="{link}"><img src="sites/{s["slug"]}/card.jpg" width="100%" alt="{s["name"]}"></a><br>'
                           f'<b><a href="{link}">{s["name"]}</a></b><br><sub>{s["idea"]}</sub></td>')
            out.append('</tr>')
        out.append('</table>')
        out.append('')
    out.append('<!-- gallery:end -->')
    return '\n'.join(out)


def replace_block(text, block, start='<!-- gallery:start -->', end='<!-- gallery:end -->', after_first_line=False):
    if start in text and end in text:
        return text[:text.index(start)] + block + text[text.index(end) + len(end):]
    if after_first_line:
        first, _, rest = text.partition('\n')
        return first + '\n\n' + block + '\n' + rest
    return text + '\n' + block + '\n'


def write_readme(sites):
    path = p('README.md')
    with open(path, encoding='utf-8') as f:
        text = f.read()
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(replace_block(text, readme_block(sites)))


def write_wall_md(sites):
    out = ['# Every screen', '', f'All {sum(len(s.get("shots", [])) for s in sites)} screenshots. Click any image for full size, or a name for the teardown.', '',
           '[Back to the gallery](README.md)', '']
    for g, title in GROUPS.items():
        group = [s for s in sites if s['group'] == g and s.get('shots')]
        if not group:
            continue
        out += [f'## {title}', '']
        for s in group:
            out.append(f'### [{s["name"]}](sites/{s["slug"]}/teardown.md)')
            out.append('')
            imgs = []
            for f in s['shots']:
                w = 120 if f == 'phone.jpg' else 240
                imgs.append(f'<a href="sites/{s["slug"]}/{f}"><img src="sites/{s["slug"]}/t/{f}" width="{w}"></a>')
            out.append(' '.join(imgs))
            out.append('')
    with open(p('wall.md'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(out))


def write_nav(sites):
    ordered = [s for s in sites if s.get('shots')]
    for i, s in enumerate(ordered):
        path = p('sites', s['slug'], 'teardown.md')
        if not os.path.exists(path):
            continue
        prev_s, next_s = ordered[i - 1], ordered[(i + 1) % len(ordered)]
        title = GROUPS[s['group']]
        lines = ['<!-- gallery:start -->',
                 f'<p><a href="../../README.md#{anchor(title)}">All sites</a> &nbsp;&nbsp; '
                 f'<a href="../{prev_s["slug"]}/teardown.md">&larr; {prev_s["name"]}</a> &nbsp;&nbsp; '
                 f'<a href="../{next_s["slug"]}/teardown.md">{next_s["name"]} &rarr;</a> &nbsp;&nbsp; '
                 f'<a href="{s["url"]}">Open the live site</a></p>']
        if s.get('motion'):
            lines.append(f'<p><img src="motion.webp" width="100%" alt="{s["name"]}, first seconds with the cursor moving"></p>')
        lines.append('<!-- gallery:end -->')
        with open(path, encoding='utf-8') as f:
            text = f.read()
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(replace_block(text, '\n'.join(lines), after_first_line=True))


def write_data(sites):
    data = [{k: s.get(k) for k in ('slug', 'name', 'idea', 'url', 'group', 'shots', 'motion')} | {'groupTitle': GROUPS[s['group']],
            'stack': {k: s.get('stack', {}).get(k) for k in ('libs', 'fonts', 'weightKB')}} for s in sites if s.get('shots')]
    with open(p('gallery.data.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('window.SITES = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')


if __name__ == '__main__':
    sites = load_sites()
    for s in sites:
        build_images(s)
    build_wall(sites)
    write_readme(sites)
    write_wall_md(sites)
    write_nav(sites)
    write_data(sites)
    print(f'gallery: {len(sites)} sites, {sum(len(s.get("shots", [])) for s in sites)} shots, '
          f'{sum(1 for s in sites if s.get("motion"))} motion previews')
