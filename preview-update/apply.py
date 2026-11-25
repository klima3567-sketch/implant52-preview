"""Apply the current offer pages and assistant to the static preview base."""

from hashlib import sha256
import json
from pathlib import Path
import re
import shutil
import sys

site = Path(sys.argv[1])
update = Path(__file__).resolve().parent
app = update / "app.js"
knowledge = update / "slavik-knowledge.json"
css = update / "offers.css"
widget = (update / "slavik.html").read_text().strip()
offer_entries = json.loads((update / "offer-search.json").read_text())
offers = json.loads(knowledge.read_text())["offers"]
origin = "/implant52-preview/"
widget_start = '<div class="slavik" data-slavik'
widget_end = '<script src="/implant52-preview/app.js"'
revision = sha256(app.read_bytes() + css.read_bytes() + knowledge.read_bytes()).hexdigest()[:12]
assert (site / "index.html").is_file()
assert len(offers) == len(offer_entries) - 1

for resource in (app, knowledge):
    shutil.copyfile(resource, site / resource.name)
with (site / "style.css").open("a", encoding="utf-8") as stylesheet:
    stylesheet.write("\n" + css.read_text())

lookup = {entry["url"]: entry for entry in offer_entries}
search_path = site / "search-index.json"
search = json.loads(search_path.read_text())
assert set(lookup).issubset({entry["url"] for entry in search})
search_path.write_text(json.dumps(
    [lookup.get(entry["url"], entry) for entry in search], ensure_ascii=False
))

for source in (update / "offers").glob("*.html"):
    route = "offers" if source.stem == "index" else f"offers/{source.stem}"
    destination = site / route / "index.html"
    markup = destination.read_text()
    head, main = source.read_text().split("</head>", 1)
    for tag, fragment in (("head", head + "</head>"), ("main", main.strip())):
        start = markup.index("<" + tag)
        end = markup.index("</" + tag + ">", start) + len(tag) + 3
        markup = markup[:start] + fragment + markup[end:]
    destination.write_text(markup)

for page in sorted(site.rglob("*.html")):
    markup = page.read_text()
    assert '<meta name="robots" content="noindex,nofollow">' in markup, page
    start = markup.index(widget_start)
    end = markup.index(widget_end, start)
    markup = markup[:start] + widget + "\n" + markup[end:]
    markup = re.sub(
        r'("(?:/implant52-preview/)(?:app\.js|style\.css))"',
        lambda match: match[1] + "?v=" + revision + '"',
        markup,
    )
    page.write_text(markup)

print(f"Prepared {len(offers)} offer pages and Slavik for Pages revision {revision}")
