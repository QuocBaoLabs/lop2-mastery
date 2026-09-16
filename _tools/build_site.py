import json, os, shutil, sys

ROOT = r"E:\sach hoc\lop2-mastery-data"
SITE_DATA = os.path.join(ROOT, "site", "data")

DOCS = [
    ("README.md", "README — START HERE FOR CODEX"),
    ("CURRICULUM_OVERVIEW.md", "Tổng quan chương trình"),
    ("PRODUCT_SPEC.md", "Product Spec"),
    ("DASHBOARD_SPEC.md", "Dashboard Spec"),
    ("MASTERY_MODEL.md", "Mastery Model"),
    ("SPACED_REPETITION.md", "Spaced Repetition"),
    ("FAST_TRACK.md", "Fast Track"),
    ("80_20_ANALYSIS.md", "Phân tích 80/20"),
    ("MUST_MASTER.md", "MUST MASTER"),
    ("LEARNING_ENGINE.md", "Learning Engine"),
    ("ERROR_MODEL.md", "Error Model"),
    ("database_schema.md", "Database Schema"),
    ("AUDIT_REPORT.md", "Audit Report"),
]

def main():
    if os.path.exists(SITE_DATA):
        shutil.rmtree(SITE_DATA)
    os.makedirs(SITE_DATA)
    docs_out = os.path.join(SITE_DATA, "docs")
    os.makedirs(docs_out)

    files = []
    for sub in ["curriculum", "skills", "exercises", "assessment", "rules", "source_map"]:
        src = os.path.join(ROOT, sub)
        if not os.path.isdir(src):
            continue
        for fn in sorted(os.listdir(src)):
            if not fn.endswith(".json"):
                continue
            dst = os.path.join(SITE_DATA, sub, fn)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(os.path.join(src, fn), dst)
            files.append({"path": "data/" + sub + "/" + fn, "size": os.path.getsize(dst)})

    docs = []
    for fn, label in DOCS:
        src = os.path.join(ROOT, fn)
        if not os.path.exists(src):
            continue
        dst = os.path.join(docs_out, fn)
        shutil.copy2(src, dst)
        docs.append({"label": label, "path": "data/docs/" + fn})

    manifest = {"files": files, "docs": docs, "generated": "build_site.py"}
    with open(os.path.join(SITE_DATA, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    print(f"copied {len(files)} json files, {len(docs)} docs")

if __name__ == "__main__":
    main()
