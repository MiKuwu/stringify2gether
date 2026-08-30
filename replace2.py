import re

with open('src/app/category/[slug]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure Image is imported
if 'import Image from "next/image"' not in content:
    content = content.replace('import Link from "next/link"', 'import Link from "next/link"\nimport Image from "next/image"')

# Replace banner img
content = re.sub(
    r'<img src=\{category\.bannerUrl\} alt=\{category\.name\} className="w-full h-full object-cover" />',
    r'<Image src={category.bannerUrl} alt={category.name} fill priority sizes="100vw" className="object-cover" />',
    content
)

# Replace post media
content = re.sub(
    r'<img\s+src=\{post\.media\[0\]\.type === "VIDEO" \? post\.media\[0\]\.url\.replace\([^)]+\) : post\.media\[0\]\.url\}\s+alt=\{post\.title\}\s+loading="lazy"\s+decoding="async"\s+className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"\s*/>',
    r'<Image src={post.media[0].type === "VIDEO" ? post.media[0].url.replace(/\\.[^/.]+$/, ".jpg") : post.media[0].url} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />',
    content
)

with open('src/app/category/[slug]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
